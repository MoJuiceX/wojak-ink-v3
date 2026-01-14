// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '@/contexts/AudioContext';
// import { useMedia } from '@/contexts/MediaContext'; // Temporarily disabled
import './OrangeJuggle.css';

// Sound effect for bouncing (Web Audio API for low latency)
const createBounceSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };
  } catch (e) {
    return () => {}; // Fallback if Web Audio not supported
  }
};

// Game constants
const PADDLE_SIZE = 150; // Match the sprite display size
const PADDLE_COLLISION_RADIUS = 50; // Smaller hit area - orange must touch orangutan
const ORANGE_SIZE = 56; // Bigger oranges for better visibility
const POWERUP_SIZE = 35;
const GRAVITY = 0.3;
const BOUNCE_DAMPING = 0.7;
const HIT_VELOCITY = -7; // Gentle upward bounce

// Speed modifiers for power-ups (stacking)
// Bananas: 1=1.5x, 2=2x, 3=2.5x faster
// Rums: 1=0.7x, 2=0.5x, 3=0.3x + reversed
const BANANA_SPEEDS = [1, 1.5, 2.0, 2.5]; // Index = banana count
const RUM_SPEEDS = [1, 0.7, 0.5, 0.3]; // Index = rum count
const POWERUP_FALL_SPEED = 2; // Power-ups fall slowly at constant speed
const RUMS_FOR_REVERSE = 1; // Number of rums to trigger reversed controls (1 = immediate)

// Orangutan sprite (2 frames: left hands up, right hands up)
const JUGGLE_SPRITE = '/assets/games/juggle.png';

// Combo decay - reset combo if no hits for this duration (ms)
const COMBO_DECAY_TIME = 2500;

// Level configuration - 5 levels, progressively harder
// Level 1: Just oranges (learn to juggle)
// Level 2+: Rum spawns (1st = reverse controls, 2nd = slower, 3rd = even slower)
// Level 3+: Bananas spawn (speed boost + clears rum effects)
// Camels: hitting one = restart from level 1
// camelChance: probability (0-1) of spawning a camel every few seconds
const LEVEL_CONFIG = {
  1: { oranges: 1, rumEnabled: false, bananaEnabled: false, gravity: 0.12, time: 15, targetScore: 500, camelChance: 0, chaos: 1.0 },
  2: { oranges: 1, rumEnabled: true, bananaEnabled: false, gravity: 0.13, time: 20, targetScore: 2000, camelChance: 0.10, chaos: 1.3 },
  3: { oranges: 2, rumEnabled: true, bananaEnabled: true, gravity: 0.14, time: 25, targetScore: 5000, camelChance: 0.15, chaos: 1.6 },
  4: { oranges: 2, rumEnabled: true, bananaEnabled: true, gravity: 0.15, time: 30, targetScore: 10000, camelChance: 0.20, chaos: 2.0 },
  5: { oranges: 3, rumEnabled: true, bananaEnabled: true, gravity: 0.16, time: 40, targetScore: 0, camelChance: 0.25, chaos: 2.5 },
};

// Camel behavior constants
const CAMEL_SIZE = 50;
const CAMEL_SPAWN_INTERVAL = 2500; // Check for camel spawn every 2.5 seconds
const CAMEL_BOUNCE_VELOCITY = -8; // Small bounce when hitting bottom
const CAMEL_JUMP_VELOCITY = -14; // Jump off screen after bounce

// Camel spawn patterns - makes them more interesting
type CamelPattern = 'straight' | 'arc-left' | 'arc-right' | 'diagonal-left' | 'diagonal-right';
const CAMEL_PATTERNS: CamelPattern[] = ['straight', 'arc-left', 'arc-right', 'diagonal-left', 'diagonal-right'];

interface GameObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'orange' | 'golden' | 'banana' | 'rum' | 'camel';
  wasHit: boolean; // True if player has hit this orange at least once (actively juggling)
  bounceCount?: number; // For camels: track how many times they've bounced
  pattern?: CamelPattern; // Movement pattern for camels
}

interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}

type GameState = 'menu' | 'playing' | 'levelComplete' | 'saveScore';
type GameMode = 'campaign';

const OrangeJuggle: React.FC = () => {
  // Audio context for sound effects
  const { isSoundEffectsEnabled } = useAudio();
  // const { videoPlayer, musicPlayer } = useMedia(); // Temporarily disabled

  // Sad images for camel loss screen
  const SAD_IMAGES = [
    '/assets/games/sad_1.png',
    '/assets/games/sad_2.png',
    '/assets/games/sad_3.png',
    '/assets/games/sad_4.png',
    '/assets/games/sad_5.png',
  ];

  // Game state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [orangutanBounce, setOrangutanBounce] = useState(false); // Visual bounce effect
  const [lostByCamel, setLostByCamel] = useState(false); // Track if lost by hitting camel
  const [sadImage, setSadImage] = useState(''); // Random sad image for camel loss

  // Sound effect refs
  const bounceSoundRef = useRef<(() => void) | null>(null);

  // High scores and leaderboard
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('orangeJuggleHighScore') || '0', 10);
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('orangeJuggleLeaderboard') || '[]');
    } catch {
      return [];
    }
  });
  const [playerName, setPlayerName] = useState('');

  // Game objects
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [paddleX, setPaddleX] = useState(0);
  const [paddleY, setPaddleY] = useState(0);

  // Power-up effects
  const [speedModifier, setSpeedModifier] = useState(1); // 1 = normal, >1 = faster, <1 = slower
  const [activePowerup, setActivePowerup] = useState<'banana' | 'rum' | null>(null);
  const [isReversed, setIsReversed] = useState(false); // UI state for reversed controls indicator
  const [rumCount, setRumCount] = useState(0); // UI state for rum count
  const [bananaCount, setBananaCount] = useState(0); // UI state for banana count

  // Refs - use refs for game loop to avoid stale closures
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const objectIdRef = useRef(0);
  const lastHitTimeRef = useRef(0);
  const goldenSpawnTimeRef = useRef(0);
  const paddleRef = useRef({ x: 0, y: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const objectsRef = useRef<GameObject[]>([]); // Direct access to objects for game loop
  const speedModifierRef = useRef(1);
  const powerupTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const nextPowerupSpawnRef = useRef(0); // Time for next power-up spawn
  const nextCamelSpawnRef = useRef(0); // Time for next camel spawn check
  const rumCountRef = useRef(0); // Track consecutive rums for reversed controls
  const bananaCountRef = useRef(0); // Track consecutive bananas for speed boost
  const isReversedRef = useRef(false); // Whether controls are reversed

  // Initialize bounce sound effect
  useEffect(() => {
    bounceSoundRef.current = createBounceSound();
  }, []);

  // Background music disabled for now - can re-enable later
  // useEffect(() => {
  //   if (gameState === 'playing') {
  //     const isVideoPlaying = videoPlayer?.isPlaying;
  //     const isMusicPlaying = musicPlayer?.isPlaying;
  //     if (!isVideoPlaying && !isMusicPlaying && !isBackgroundMusicPlaying) {
  //       playBackgroundMusic();
  //     }
  //   }
  // }, [gameState, videoPlayer?.isPlaying, musicPlayer?.isPlaying, isBackgroundMusicPlaying, playBackgroundMusic]);

  // Play bounce sound helper
  const playBounceSound = useCallback(() => {
    if (isSoundEffectsEnabled && bounceSoundRef.current) {
      bounceSoundRef.current();
    }
  }, [isSoundEffectsEnabled]);

  // Trigger orangutan bounce animation
  const triggerOrangutanBounce = useCallback(() => {
    setOrangutanBounce(true);
    setTimeout(() => setOrangutanBounce(false), 100);
  }, []);

  // Get current level config
  const getLevelConfig = useCallback(() => {
    return LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
  }, [level]);

  // Spawn an object
  const spawnObject = useCallback((type: 'orange' | 'golden' | 'banana' | 'rum' | 'camel') => {
    const width = gameAreaRef.current?.offsetWidth || 300;

    // Power-ups fall straight down, other objects use normal physics
    const isPowerup = type === 'banana' || type === 'rum';
    const isCamel = type === 'camel';

    // Default spawn values
    let spawnX = 50 + Math.random() * (width - 100);
    let spawnY = isPowerup ? -50 : 50 + Math.random() * 100;
    let spawnVx = 0;
    let spawnVy = isPowerup ? POWERUP_FALL_SPEED : 0;
    let pattern: CamelPattern | undefined = undefined;

    // Camel spawn patterns - more interesting movement!
    if (isCamel) {
      pattern = CAMEL_PATTERNS[Math.floor(Math.random() * CAMEL_PATTERNS.length)];

      switch (pattern) {
        case 'straight':
          // Fall straight down from random position
          spawnX = 50 + Math.random() * (width - 100);
          spawnY = -CAMEL_SIZE;
          spawnVx = 0;
          spawnVy = 2;
          break;
        case 'arc-left':
          // Start from right, arc to the left
          spawnX = width - 50;
          spawnY = -CAMEL_SIZE;
          spawnVx = -3 - Math.random() * 2;
          spawnVy = 1;
          break;
        case 'arc-right':
          // Start from left, arc to the right
          spawnX = 50;
          spawnY = -CAMEL_SIZE;
          spawnVx = 3 + Math.random() * 2;
          spawnVy = 1;
          break;
        case 'diagonal-left':
          // Start from upper right, move diagonally left
          spawnX = width - 30;
          spawnY = -CAMEL_SIZE;
          spawnVx = -2;
          spawnVy = 2.5;
          break;
        case 'diagonal-right':
          // Start from upper left, move diagonally right
          spawnX = 30;
          spawnY = -CAMEL_SIZE;
          spawnVx = 2;
          spawnVy = 2.5;
          break;
      }
    }

    const obj: GameObject = {
      id: objectIdRef.current++,
      x: spawnX,
      y: spawnY,
      vx: spawnVx,
      vy: spawnVy,
      type,
      wasHit: false,
      bounceCount: isCamel ? 0 : undefined,
      pattern: isCamel ? pattern : undefined,
    };

    // Update both ref and state
    objectsRef.current = [...objectsRef.current, obj];
    setObjects(objectsRef.current);
    return obj;
  }, []);

  // Initialize game
  const startGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    objectsRef.current = [];
    setObjects([]);
    // Reset refs
    objectIdRef.current = 0;
    goldenSpawnTimeRef.current = Date.now() + 15000;
    scoreRef.current = 0;
    comboRef.current = 0;
    lastHitTimeRef.current = Date.now(); // Start combo decay timer from now
    // Reset power-up state
    speedModifierRef.current = 1;
    setSpeedModifier(1);
    setActivePowerup(null);
    rumCountRef.current = 0;
    bananaCountRef.current = 0;
    setRumCount(0);
    setBananaCount(0);
    isReversedRef.current = false;
    setIsReversed(false);
    if (powerupTimerRef.current) {
      clearTimeout(powerupTimerRef.current);
    }
    // Power-ups spawn after 5 seconds in levels that have them
    nextPowerupSpawnRef.current = Date.now() + 5000;
    // Camels start spawning after 3 seconds
    nextCamelSpawnRef.current = Date.now() + 3000;
    // Initialize paddle to center-bottom of screen
    const width = gameAreaRef.current?.offsetWidth || 300;
    const height = gameAreaRef.current?.offsetHeight || 500;
    const startX = (width - PADDLE_SIZE) / 2;
    const startY = height - PADDLE_SIZE; // Anchored at bottom
    setPaddleX(startX);
    setPaddleY(startY);
    paddleRef.current = { x: startX, y: startY };

    const config = mode === 'campaign'
      ? LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG]
      : LEVEL_CONFIG[1];

    setTimeLeft(config.time);

    // Spawn initial oranges
    for (let i = 0; i < config.oranges; i++) {
      setTimeout(() => spawnObject('orange'), i * 500);
    }
  }, [level, spawnObject]);

  // Start next level
  const startNextLevel = useCallback(() => {
    const nextLevel = level + 1;
    if (nextLevel > 5) {
      // This shouldn't happen normally, but just in case
      setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
      setGameState('saveScore');
      return;
    }

    setLevel(nextLevel);
    objectsRef.current = [];
    setObjects([]);
    setCombo(0);
    comboRef.current = 0;
    lastHitTimeRef.current = Date.now(); // Reset combo decay timer
    goldenSpawnTimeRef.current = Date.now() + 15000;
    // Reset power-up state for new level
    speedModifierRef.current = 1;
    setSpeedModifier(1);
    setActivePowerup(null);
    rumCountRef.current = 0;
    bananaCountRef.current = 0;
    setRumCount(0);
    setBananaCount(0);
    isReversedRef.current = false;
    setIsReversed(false);
    if (powerupTimerRef.current) {
      clearTimeout(powerupTimerRef.current);
    }
    nextPowerupSpawnRef.current = Date.now() + 5000;
    nextCamelSpawnRef.current = Date.now() + 3000;

    const config = LEVEL_CONFIG[nextLevel as keyof typeof LEVEL_CONFIG];
    setTimeLeft(config.time);
    setGameState('playing');

    // Spawn oranges for new level
    for (let i = 0; i < config.oranges; i++) {
      setTimeout(() => spawnObject('orange'), i * 500);
    }
  }, [level, spawnObject]);

  // Handle paddle movement - free horizontal, anchored at bottom with 10% vertical range
  // Speed modifier affects how quickly paddle reaches target position
  // Reversed controls: X movement is inverted (move right = go left)
  const updatePaddle = useCallback((clientX: number, clientY: number) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate target position relative to game area
    let targetX = clientX - rect.left - PADDLE_SIZE / 2;
    let targetY = clientY - rect.top - PADDLE_SIZE / 2;

    // If controls are reversed, invert X around the center of the screen
    if (isReversedRef.current) {
      const centerX = rect.width / 2;
      targetX = centerX + (centerX - targetX) - PADDLE_SIZE / 2;
    }

    // Horizontal: allow 10% overflow on sides
    const overflowX = rect.width * 0.10;
    const minX = -overflowX;
    const maxX = rect.width - PADDLE_SIZE + overflowX;

    // Vertical: bottom of orangutan stays at lightbox bottom, can move 15% up
    // Sprite (120px) is centered in paddle (150px), so there's 15px gap at bottom
    const spriteOffset = 15; // Adjust for centered sprite
    const bottomPosition = rect.height - PADDLE_SIZE + spriteOffset;
    const minY = bottomPosition - (rect.height * 0.15); // Can move 15% up
    const maxY = bottomPosition; // Cannot go below - bottom stays at lightbox bottom

    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(minY, Math.min(maxY, targetY));

    // Apply smooth interpolation for fluid movement
    // Base smoothness factor (0.25 = smooth, 1.0 = instant)
    const baseSmoothness = 0.25;
    const speed = speedModifierRef.current;
    const currentX = paddleRef.current.x;
    const currentY = paddleRef.current.y;

    // Adjust smoothness based on power-ups
    // Banana (speed > 1): more responsive (higher lerp)
    // Rum (speed < 1): more sluggish (lower lerp)
    let lerpFactor;
    if (speed >= 1) {
      // Normal or fast - responsive but still smooth
      lerpFactor = baseSmoothness + (speed - 1) * 0.15; // 1.0 = 0.25, 2.5 = 0.475
      lerpFactor = Math.min(lerpFactor, 0.5); // Cap at 0.5 for some smoothness
    } else {
      // Slow (rum effect) - more sluggish
      lerpFactor = baseSmoothness * speed; // 0.5 = 0.125, very laggy
    }

    // Lerp toward target position
    const x = currentX + (targetX - currentX) * lerpFactor;
    const y = currentY + (targetY - currentY) * lerpFactor;

    setPaddleX(x);
    setPaddleY(y);
    // Update ref for collision detection (avoids stale closure)
    paddleRef.current = { x, y };
  }, []);

  // Use document-level mouse/touch events so paddle works even outside lightbox
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePaddle(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updatePaddle(e.touches[0].clientX, e.touches[0].clientY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, updatePaddle]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const width = gameAreaRef.current?.offsetWidth || 300;
      const height = gameAreaRef.current?.offsetHeight || 500;
      // Get gravity based on current level
      const gravity = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG]?.gravity || 0.3;

      // Track hits this frame
      let hitOrange = false;
      let hitGolden = false;
      let hitCamel = false;
      let collectedPowerup: 'banana' | 'rum' | null = null;
      const objectsToRemove: number[] = []; // IDs of objects to remove (power-ups and dropped oranges)
      const droppedOrangeIds: number[] = []; // Track which oranges were dropped this frame

      // Process objects directly using ref (avoids async state issues)
      const newObjects = objectsRef.current.map(obj => {
        let { x, y, vx, vy, type, id, wasHit, bounceCount, pattern } = obj;
        // Get size based on object type
        const size = type === 'camel' ? CAMEL_SIZE
          : (type === 'banana' || type === 'rum') ? POWERUP_SIZE
          : ORANGE_SIZE;

        const isPowerup = type === 'banana' || type === 'rum';
        const isCamel = type === 'camel';

        // Apply gravity (not for power-ups at constant speed, camels use gravity)
        if (!isPowerup) {
          vy += gravity;
        }

        // Update position
        x += vx;
        y += vy;

        // Bounce off walls (left, right only - top is open)
        // Power-ups and camels don't bounce off walls - they just fall straight down
        if (!isPowerup && !isCamel) {
          if (x <= 0) {
            x = 0;
            vx = Math.abs(vx) * BOUNCE_DAMPING;
          }
          if (x >= width - size) {
            x = width - size;
            vx = -Math.abs(vx) * BOUNCE_DAMPING;
          }
        }

        // PADDLE COLLISION - check BEFORE bottom collision so we score points
        const objCenterX = x + size / 2;
        const objCenterY = y + size / 2;
        const paddleCenterX = paddleRef.current.x + PADDLE_SIZE / 2;
        // Collision point at orangutan's hands (top of sprite area)
        const paddleHandsY = paddleRef.current.y + 45; // Hands area
        const dx = objCenterX - paddleCenterX;
        const dy = objCenterY - paddleHandsY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionRadius = size / 2 + PADDLE_COLLISION_RADIUS;

        let hitPaddle = false;
        // Only bounce if coming from above (vy > 0 means falling down)
        if (distance < collisionRadius && vy > 0) {
          hitPaddle = true;

          // Camel collision = game over!
          if (type === 'camel') {
            hitCamel = true;
          }
          // Power-ups are collected, not bounced
          else if (type === 'banana' || type === 'rum') {
            collectedPowerup = type;
            objectsToRemove.push(id);
          } else {
            // BOUNCE with randomness that increases per level (chaos multiplier)
            const currentConfig = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
            const chaos = currentConfig.chaos || 1.0;

            // Random height: base 0.7x to 1.4x, scaled by chaos
            const heightRange = 0.7 * chaos; // More chaos = bigger height variation
            const heightVariation = 0.7 + Math.random() * heightRange;
            vy = HIT_VELOCITY * heightVariation;

            // Random horizontal direction: scaled by chaos
            // Base direction from hit offset, plus random component that grows with chaos
            const hitOffset = dx / collisionRadius;
            const baseHorizontal = hitOffset * 3;
            const randomDirection = (Math.random() - 0.5) * (10 * chaos); // More chaos = more sideways
            vx = baseHorizontal + randomDirection;

            wasHit = true; // Mark as actively juggled

            // Track what was hit
            if (type === 'golden') {
              hitGolden = true;
            } else {
              hitOrange = true;
            }
          }
        }

        // Bottom collision - only if didn't hit paddle
        if (!hitPaddle && y >= height - size) {
          // Power-ups disappear when they hit the bottom (no penalty)
          if (type === 'banana' || type === 'rum') {
            objectsToRemove.push(id);
          }
          // Camel: bounce once, then jump off screen
          else if (type === 'camel') {
            y = height - size;
            if (bounceCount === 0) {
              // First bounce - small bounce
              vy = CAMEL_BOUNCE_VELOCITY;
              bounceCount = 1;
            } else {
              // Second hit - big jump to exit
              vy = CAMEL_JUMP_VELOCITY;
              bounceCount = 2;
            }
          } else {
            y = height - size;
            vy = -Math.abs(vy) * BOUNCE_DAMPING;

            // Track that this orange just hit the ground (for combo check)
            if ((type === 'orange' || type === 'golden') && wasHit) {
              droppedOrangeIds.push(id);
            }

            // Orange stopped bouncing = remove and respawn
            if ((type === 'orange' || type === 'golden') && Math.abs(vy) < 2) {
              objectsToRemove.push(id); // Remove dropped orange from game
              // Spawn a new orange to replace it
              if (type === 'orange') {
                setTimeout(() => spawnObject('orange'), 500);
              }
            }
          }
        }

        // Remove camels that have jumped off the top of the screen
        if (type === 'camel' && bounceCount === 2 && y < -CAMEL_SIZE) {
          objectsToRemove.push(id);
        }

        return { id, x, y, vx, vy, type, wasHit, bounceCount, pattern };
      });

      // Filter out removed objects (collected power-ups and dropped oranges)
      const filteredObjects = objectsToRemove.length > 0
        ? newObjects.filter(obj => !objectsToRemove.includes(obj.id))
        : newObjects;

      // Update both ref and state
      objectsRef.current = filteredObjects;
      setObjects(filteredObjects);

      // Check if combo should be reset (when a juggled orange hits the ground)
      if (droppedOrangeIds.length > 0) {
        // Count oranges that are actively being juggled:
        // - wasHit = true (player has hit it)
        // - vy < 0 (moving upward, meaning it was just hit and is in the air)
        const orangesActivelyJuggled = newObjects.filter(obj => {
          // Exclude oranges that just hit the ground this frame
          if (droppedOrangeIds.includes(obj.id)) return false;
          // Only count oranges (not power-ups)
          if (obj.type !== 'orange' && obj.type !== 'golden') return false;
          // Must have been hit at least once
          if (!obj.wasHit) return false;
          // Must be moving upward (was just hit) - this means actively juggled
          return obj.vy < 0;
        });

        // Reset combo if NO other oranges are actively being juggled (moving upward)
        if (orangesActivelyJuggled.length === 0) {
          comboRef.current = 0;
          setCombo(0);
        }
      }

      // Apply collected power-up (stacking effects)
      if (collectedPowerup) {
        if (collectedPowerup === 'banana') {
          // Banana: faster movement, reset rum count and reversed controls
          rumCountRef.current = 0;
          setRumCount(0);
          isReversedRef.current = false;
          setIsReversed(false);

          // Stack bananas up to 3
          bananaCountRef.current = Math.min(bananaCountRef.current + 1, 3);
          setBananaCount(bananaCountRef.current);

          // Apply stacking speed boost
          const speedIndex = bananaCountRef.current;
          speedModifierRef.current = BANANA_SPEEDS[speedIndex];
          setSpeedModifier(BANANA_SPEEDS[speedIndex]);
          setActivePowerup('banana');
        } else {
          // Rum: slower movement, reset banana count
          bananaCountRef.current = 0;
          setBananaCount(0);

          // Stack rums up to 3
          rumCountRef.current = Math.min(rumCountRef.current + 1, 3);
          setRumCount(rumCountRef.current);

          // Apply stacking speed slow
          const speedIndex = rumCountRef.current;
          speedModifierRef.current = RUM_SPEEDS[speedIndex];
          setSpeedModifier(RUM_SPEEDS[speedIndex]);
          setActivePowerup('rum');

          // 3 rums = reversed controls!
          if (rumCountRef.current >= RUMS_FOR_REVERSE) {
            isReversedRef.current = true;
            setIsReversed(true);
          }
        }
      }

      // Process collision results - score points!
      if (hitOrange || hitGolden) {
        comboRef.current = Math.min(comboRef.current + 1, 10);
        const points = hitGolden ? 50 * comboRef.current : 10 * comboRef.current;
        scoreRef.current += points;
        setScore(scoreRef.current);
        setCombo(comboRef.current);
        lastHitTimeRef.current = Date.now(); // Reset combo decay timer

        // Play bounce sound and trigger orangutan animation
        playBounceSound();
        triggerOrangutanBounce();
      }

      // Combo decay - reset combo if no hits for too long
      if (comboRef.current > 0 && Date.now() - lastHitTimeRef.current > COMBO_DECAY_TIME) {
        comboRef.current = 0;
        setCombo(0);
      }

      // Check for golden orange spawn
      if (Date.now() > goldenSpawnTimeRef.current) {
        setObjects(prev => {
          const hasGolden = prev.some(o => o.type === 'golden');
          if (!hasGolden) {
            setTimeout(() => {
              spawnObject('golden');
              setTimeout(() => {
                objectsRef.current = objectsRef.current.filter(o => o.type !== 'golden');
                setObjects(objectsRef.current);
              }, 5000);
            }, 0);
          }
          return prev;
        });
        goldenSpawnTimeRef.current = Date.now() + 15000 + Math.random() * 5000;
      }

      // Check for power-up spawn (rum from level 2, banana from level 3)
      const currentConfig = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
      if (Date.now() > nextPowerupSpawnRef.current) {
        // Determine which powerups can spawn this level
        const canSpawnRum = currentConfig.rumEnabled;
        const canSpawnBanana = currentConfig.bananaEnabled;

        if (canSpawnRum || canSpawnBanana) {
          let powerupType: 'banana' | 'rum' | null = null;

          if (canSpawnRum && canSpawnBanana) {
            // Both available - random choice
            powerupType = Math.random() > 0.5 ? 'banana' : 'rum';
          } else if (canSpawnRum) {
            // Only rum available (level 2)
            powerupType = 'rum';
          } else if (canSpawnBanana) {
            // Only banana available (shouldn't happen with current config)
            powerupType = 'banana';
          }

          if (powerupType) {
            setTimeout(() => {
              spawnObject(powerupType!);
            }, 0);
          }
          // Next power-up in 3-6 seconds
          nextPowerupSpawnRef.current = Date.now() + 3000 + Math.random() * 3000;
        }
      }

      // Check for camel spawn (based on level's camelChance)
      if (currentConfig.camelChance > 0 && Date.now() > nextCamelSpawnRef.current) {
        // Roll the dice - spawn camel based on chance
        if (Math.random() < currentConfig.camelChance) {
          setTimeout(() => {
            spawnObject('camel');
          }, 0);
        }
        // Check again in 2 seconds
        nextCamelSpawnRef.current = Date.now() + CAMEL_SPAWN_INTERVAL;
      }

      // Handle camel collision - restart from level 1!
      if (hitCamel) {
        // Stop the game loop
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        // Set camel loss state and pick random sad image
        setLostByCamel(true);
        setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
        // Reset to level 1 and show save score screen
        setLevel(1);
        setGameState('saveScore');
        return;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, gameMode, level, highScore]); // Using refs for most logic, minimal deps

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up! Use scoreRef.current to get latest score (avoids stale closure)
          const currentScore = scoreRef.current;
          if (currentScore >= config.targetScore) {
            if (level >= 5) {
              // Completed all levels - go to save score screen
              setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
              setGameState('saveScore');
              if (currentScore > highScore) {
                setHighScore(currentScore);
                localStorage.setItem('orangeJuggleHighScore', String(currentScore));
              }
            } else {
              setGameState('levelComplete');
            }
          } else {
            // Didn't reach target score - game over
            setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
            setGameState('saveScore'); // Still allow saving score
            if (currentScore > highScore) {
              setHighScore(currentScore);
              localStorage.setItem('orangeJuggleHighScore', String(currentScore));
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, gameMode, level, highScore]);


  const goToMenu = () => {
    setGameState('menu');
    setGameMode(null);
    setLevel(1);
    setPlayerName('');
    objectsRef.current = [];
    setObjects([]);
    // Reset power-up state
    speedModifierRef.current = 1;
    setSpeedModifier(1);
    setActivePowerup(null);
    rumCountRef.current = 0;
    bananaCountRef.current = 0;
    setRumCount(0);
    setBananaCount(0);
    isReversedRef.current = false;
    setIsReversed(false);
    // Reset camel loss state
    setLostByCamel(false);
    setSadImage('');
    if (powerupTimerRef.current) {
      clearTimeout(powerupTimerRef.current);
    }
  };

  const saveScore = () => {
    if (!playerName.trim()) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: score,
      level: level,
      date: new Date().toISOString().split('T')[0],
    };

    // Add to leaderboard and sort by score (highest first)
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('orangeJuggleLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  const skipSaveScore = () => {
    setPlayerName('');
    goToMenu();
  };

  const config = getLevelConfig();

  return (
    <div className={`juggle-container ${gameState === 'playing' ? 'playing-mode' : ''}`}>
      {/* Title Bar HUD - shown during gameplay */}
      {gameState === 'playing' && (
        <div className="juggle-titlebar">
          <div className="titlebar-left">
            <div className="level-badge">Level {level}</div>
            {/* Show banana count */}
            {bananaCount > 0 && (
              <div className="powerup-indicator banana">
                {'🍌'.repeat(bananaCount)}
              </div>
            )}
            {/* Show rum count */}
            {rumCount > 0 && (
              <div className={`powerup-indicator rum ${isReversed ? 'reversed' : ''}`}>
                {'🥃'.repeat(rumCount)} {isReversed && '🔄'}
              </div>
            )}
          </div>
          <div className="titlebar-center">
            <span className="score">{score}</span>
            {combo > 1 && (
              <span className="combo">x{combo}</span>
            )}
          </div>
          <div className="titlebar-right">
            <span className="timer">⏱ {timeLeft}s</span>
            <span className="goal">Goal: {config.targetScore}</span>
          </div>
        </div>
      )}
      <div className="juggle-content">

        <div
          ref={gameAreaRef}
          className={`juggle-area ${gameState === 'playing' ? 'playing' : ''}`}
        >
          {/* Main Menu - Horizontal split layout */}
          {gameState === 'menu' && !gameMode && (
            <div className="game-menu-split">
              {/* Left side - Emoji and title */}
              <div className="menu-left">
                <div className="game-title">Juggle the Orange</div>
                <div className="game-emoji">🦧🍊</div>
                <p className="game-desc">Juggle oranges! Avoid camels!</p>
                <div className="mode-buttons">
                  <button onClick={() => startGame('campaign')} className="play-btn">
                    Play
                  </button>
                </div>
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

          {/* Level Complete */}
          {gameState === 'levelComplete' && (
            <div className="game-menu">
              <div className="game-title">Level {level} Complete!</div>
              <div className="game-emoji">🎉</div>
              <div className="final-score">
                <span className="score-label">Score</span>
                <span className="score-value">{score}</span>
              </div>
              <button onClick={startNextLevel} className="play-btn">
                Next Level
              </button>
            </div>
          )}


          {/* Save Score Screen */}
          {gameState === 'saveScore' && (
            <div className="game-over-screen">
              {/* Left side - Image */}
              <div className="game-over-left">
                {sadImage ? (
                  <img src={sadImage} alt="Sad wojak" className="sad-image-large" />
                ) : (
                  <div className="game-over-emoji">
                    {level >= 5 && score >= (LEVEL_CONFIG[5].targetScore) ? '🏆' : '🍊'}
                  </div>
                )}
              </div>

              {/* Right side - Content */}
              <div className="game-over-right">
                <div className="game-over-title">
                  {level >= 5 && score >= (LEVEL_CONFIG[5].targetScore)
                    ? 'You Won!'
                    : lostByCamel
                      ? 'Camel Got You!'
                      : 'Not Enough Points!'}
                </div>

                <div className="game-over-reason">
                  {level >= 5 && score >= (LEVEL_CONFIG[5].targetScore)
                    ? 'You completed all levels!'
                    : lostByCamel
                      ? 'You touched a camel and lost all progress!'
                      : `Needed ${LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG].targetScore.toLocaleString()} points`}
                </div>

                <div className="game-over-score">
                  <span className="game-over-score-value">{score}</span>
                  <span className="game-over-level">Level {level}</span>
                </div>

                {score > highScore && (
                  <div className="game-over-record">🌟 New High Score! 🌟</div>
                )}

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
                    <button
                      onClick={saveScore}
                      className="game-over-save"
                      disabled={!playerName.trim()}
                    >
                      Save Score
                    </button>
                    <button onClick={skipSaveScore} className="game-over-skip">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Objects */}
          {gameState === 'playing' && (
            <>
              {objects.map(obj => {
                // Get size based on object type
                const objSize = obj.type === 'camel' ? CAMEL_SIZE
                  : (obj.type === 'banana' || obj.type === 'rum') ? POWERUP_SIZE
                  : ORANGE_SIZE;
                return (
                  <div
                    key={obj.id}
                    className={`game-object ${obj.type}`}
                    style={{
                      left: obj.x,
                      top: obj.y,
                      width: objSize,
                      height: objSize,
                    }}
                  >
                    {obj.type === 'orange' && '🍊'}
                    {obj.type === 'golden' && '🍊'}
                    {obj.type === 'camel' && '🐫'}
                    {obj.type === 'banana' && '🍌'}
                    {obj.type === 'rum' && '🥃'}
                  </div>
                );
              })}

              {/* Paddle (Orangutan) - sprite animation runs via CSS */}
              <div
                className={`paddle ${orangutanBounce ? 'bounce' : ''}`}
                style={{
                  left: paddleX,
                  top: paddleY,
                  width: PADDLE_SIZE,
                  height: PADDLE_SIZE,
                }}
              >
                <div className="juggle-sprite" />
              </div>

              {/* Danger zone indicator */}
              <div className="danger-zone" />
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrangeJuggle;
