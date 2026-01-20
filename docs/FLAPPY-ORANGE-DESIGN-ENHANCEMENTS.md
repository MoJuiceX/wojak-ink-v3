# Flappy Orange - PREMIUM DESIGN ENHANCEMENTS

> Visual design upgrades to make Flappy Orange feel premium, polished, and immersive

**Purpose:** Transform the game's visual design from "functional" to "premium"
**Focus:** Character personality, environmental depth, modern UI, atmospheric effects

---

## Quick Design Reference

### Color Palette (Premium Orange Theme)
```typescript
const DESIGN_COLORS = {
  // Character
  orangePrimary: '#FF6B00',
  orangeLight: '#FF8C33',
  orangeDark: '#CC5500',
  orangeGlow: '#FFB366',

  // Environment - Day
  skyDay: '#87CEEB',
  skyDayLight: '#E0F6FF',
  groundDay: '#8B4513',
  grassDay: '#228B22',

  // Environment - Sunset
  skySunset: '#FF7F50',
  skySunsetLight: '#FFB347',
  sunGlow: '#FFD700',

  // Environment - Night
  skyNight: '#0D1B2A',
  skyNightLight: '#1B263B',
  starColor: '#FFFFFF',
  moonGlow: '#FFE4B5',

  // Environment - Storm
  skyStorm: '#2C3E50',
  skyStormDark: '#1A252F',
  lightning: '#E6E6FA',
  rain: '#A9C4D4',

  // UI
  scoreGold: '#FFD700',
  nearMissYellow: '#FFDD00',
  fireOrange: '#FF4500',
  successGreen: '#00FF88',
  dangerRed: '#FF6B6B',

  // Pipes
  pipeGreen: '#228B22',
  pipeGreenDark: '#1B5E20',
  pipeGreenLight: '#2E7D32',
  pipeNight: '#1A3D1A',
};
```

---

## Phase D1: CHARACTER PERSONALITY (12 tasks)

### D1.1 Eye Tracking System

Make the orange "look" at upcoming pipes - creates sense of intelligence:

```typescript
interface EyeState {
  pupilOffsetX: number;
  pupilOffsetY: number;
  targetX: number;
  targetY: number;
}

const EYE_CONFIG = {
  maxPupilOffset: 3,      // Max pixels pupil can move
  trackingSpeed: 0.15,    // Lerp speed toward target
  lookAheadDistance: 150, // How far ahead to look
};

const updateEyeTracking = (bird: Bird, pipes: Pipe[]) => {
  // Find next pipe gap
  const nextPipe = pipes.find(p => p.x > bird.x);

  if (nextPipe) {
    const gapCenterY = nextPipe.gapY + PIPE_GAP / 2;
    const distanceToPipe = nextPipe.x - bird.x;

    // Look toward gap center, more intensely when closer
    const lookIntensity = Math.max(0, 1 - (distanceToPipe / EYE_CONFIG.lookAheadDistance));

    // Calculate target pupil position
    const targetY = (gapCenterY - bird.y) * 0.02 * lookIntensity;
    const targetX = EYE_CONFIG.maxPupilOffset * lookIntensity; // Look forward

    // Lerp toward target
    eyeState.pupilOffsetX += (targetX - eyeState.pupilOffsetX) * EYE_CONFIG.trackingSpeed;
    eyeState.pupilOffsetY += (targetY - eyeState.pupilOffsetY) * EYE_CONFIG.trackingSpeed;

    // Clamp to max offset
    eyeState.pupilOffsetX = Math.max(-EYE_CONFIG.maxPupilOffset,
                            Math.min(EYE_CONFIG.maxPupilOffset, eyeState.pupilOffsetX));
    eyeState.pupilOffsetY = Math.max(-EYE_CONFIG.maxPupilOffset,
                            Math.min(EYE_CONFIG.maxPupilOffset, eyeState.pupilOffsetY));
  }
};

// In drawBird - modify pupil position
const drawEye = (ctx: CanvasRenderingContext2D, eyeX: number, eyeY: number) => {
  // White of eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupil (offset by eye tracking)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(
    eyeX + eyeState.pupilOffsetX,
    eyeY + eyeState.pupilOffsetY,
    3, 0, Math.PI * 2
  );
  ctx.fill();

  // Eye shine (always top-right of pupil)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(
    eyeX + eyeState.pupilOffsetX + 1,
    eyeY + eyeState.pupilOffsetY - 1,
    1.5, 0, Math.PI * 2
  );
  ctx.fill();
};
```

**Tasks:**
- [ ] D1.1.1 Create EyeState interface
- [ ] D1.1.2 Create EYE_CONFIG constants
- [ ] D1.1.3 Implement updateEyeTracking function
- [ ] D1.1.4 Modify drawBird to use pupil offsets
- [ ] D1.1.5 Add eye shine that moves with pupil

### D1.2 Facial Expressions

Different expressions based on game state:

```typescript
type Expression = 'neutral' | 'happy' | 'worried' | 'scared' | 'celebrating';

const EXPRESSION_CONFIG = {
  neutral: {
    eyeScale: 1.0,
    mouthType: 'smile',
    eyebrowAngle: 0
  },
  happy: {
    eyeScale: 0.8, // Squinted happy eyes
    mouthType: 'big_smile',
    eyebrowAngle: 5
  },
  worried: {
    eyeScale: 1.2, // Wide eyes
    mouthType: 'small_o',
    eyebrowAngle: -10
  },
  scared: {
    eyeScale: 1.4, // Very wide
    mouthType: 'open',
    eyebrowAngle: -15
  },
  celebrating: {
    eyeScale: 0.6, // Eyes closed in joy
    mouthType: 'big_smile',
    eyebrowAngle: 10
  }
};

const getExpression = (gameState: GameState, bird: Bird, nearestPipe: Pipe): Expression => {
  if (gameState === 'gameover') return 'scared';

  // Celebrating after milestone
  if (celebrationTimeoutRef.current) return 'celebrating';

  // Worried when close to pipe
  if (nearestPipe) {
    const distanceToPipe = nearestPipe.x - bird.x;
    if (distanceToPipe < 80 && distanceToPipe > 0) {
      return 'worried';
    }
  }

  // Scared when falling fast
  if (bird.velocity > 4) return 'worried';

  // Happy after recent pass
  if (Date.now() - lastPassTime < 500) return 'happy';

  return 'neutral';
};
```

**Tasks:**
- [ ] D1.2.1 Create Expression type and config
- [ ] D1.2.2 Implement getExpression logic
- [ ] D1.2.3 Draw different mouth shapes
- [ ] D1.2.4 Add eyebrow rendering
- [ ] D1.2.5 Smooth transitions between expressions

### D1.3 Idle Breathing Animation

Subtle bobbing when idle/playing:

```typescript
const BREATHING_CONFIG = {
  amplitude: 2,        // Pixels of vertical movement
  frequency: 0.002,    // Speed of breathing cycle
  scaleAmplitude: 0.02 // Subtle scale pulse
};

const getBreathingOffset = (frameCount: number) => {
  const breathPhase = Math.sin(frameCount * BREATHING_CONFIG.frequency * Math.PI * 2);

  return {
    yOffset: breathPhase * BREATHING_CONFIG.amplitude,
    scaleOffset: 1 + breathPhase * BREATHING_CONFIG.scaleAmplitude
  };
};

// Apply in drawBird
const breathing = getBreathingOffset(frameCount);
const drawY = bird.y + breathing.yOffset;
const drawScale = breathing.scaleOffset;
```

**Tasks:**
- [ ] D1.3.1 Create BREATHING_CONFIG
- [ ] D1.3.2 Implement getBreathingOffset
- [ ] D1.3.3 Apply to bird Y position
- [ ] D1.3.4 Apply subtle scale pulse

### D1.4 Premium Trail Effect

Tapered ribbon trail instead of simple circles:

```typescript
interface TrailSegment {
  x: number;
  y: number;
  width: number;
  alpha: number;
  age: number;
}

const TRAIL_CONFIG = {
  maxSegments: 12,
  segmentLifetime: 400, // ms
  startWidth: 14,       // Width at bird
  endWidth: 2,          // Width at trail end
  color: '#FF6B00',
  glowColor: '#FFB366'
};

const trailSegmentsRef = useRef<TrailSegment[]>([]);

const updateTrail = (bird: Bird) => {
  // Add new segment
  trailSegmentsRef.current.push({
    x: bird.x - 15, // Behind bird
    y: bird.y,
    width: TRAIL_CONFIG.startWidth,
    alpha: 0.8,
    age: 0
  });

  // Limit segments
  if (trailSegmentsRef.current.length > TRAIL_CONFIG.maxSegments) {
    trailSegmentsRef.current.shift();
  }

  // Update existing segments
  trailSegmentsRef.current.forEach((seg, i) => {
    seg.age += 16; // ~60fps
    const lifeProgress = seg.age / TRAIL_CONFIG.segmentLifetime;
    seg.alpha = 0.8 * (1 - lifeProgress);
    seg.width = TRAIL_CONFIG.startWidth -
                (TRAIL_CONFIG.startWidth - TRAIL_CONFIG.endWidth) * lifeProgress;
  });

  // Remove dead segments
  trailSegmentsRef.current = trailSegmentsRef.current.filter(
    seg => seg.age < TRAIL_CONFIG.segmentLifetime
  );
};

const drawTrail = (ctx: CanvasRenderingContext2D) => {
  if (trailSegmentsRef.current.length < 2) return;

  // Draw as connected ribbon
  ctx.beginPath();

  const segments = trailSegmentsRef.current;

  // Top edge
  ctx.moveTo(segments[0].x, segments[0].y - segments[0].width / 2);
  for (let i = 1; i < segments.length; i++) {
    ctx.lineTo(segments[i].x, segments[i].y - segments[i].width / 2);
  }

  // Bottom edge (reverse)
  for (let i = segments.length - 1; i >= 0; i--) {
    ctx.lineTo(segments[i].x, segments[i].y + segments[i].width / 2);
  }

  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createLinearGradient(
    segments[segments.length - 1].x, 0,
    segments[0].x, 0
  );
  gradient.addColorStop(0, 'rgba(255, 107, 0, 0)');
  gradient.addColorStop(1, 'rgba(255, 107, 0, 0.6)');

  ctx.fillStyle = gradient;
  ctx.fill();

  // Glow effect
  ctx.shadowColor = TRAIL_CONFIG.glowColor;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
};
```

**Tasks:**
- [ ] D1.4.1 Create TrailSegment interface
- [ ] D1.4.2 Create TRAIL_CONFIG
- [ ] D1.4.3 Implement updateTrail function
- [ ] D1.4.4 Implement drawTrail with ribbon shape
- [ ] D1.4.5 Add glow effect to trail

---

## Phase D2: ENVIRONMENT DEPTH (14 tasks)

### D2.1 Enhanced Parallax Layers

7-layer parallax system for premium depth:

```typescript
interface ParallaxLayer {
  name: string;
  speedMultiplier: number;
  yPosition: number;      // 0-1, percentage from top
  elements: ParallaxElement[];
  opacity: number;
}

const PARALLAX_LAYERS: ParallaxLayer[] = [
  // 1. Far sky (static gradient - handled separately)

  // 2. Distant mountains
  {
    name: 'mountains',
    speedMultiplier: 0.2,
    yPosition: 0.5,
    elements: [],
    opacity: 0.4
  },

  // 3. Hills
  {
    name: 'hills',
    speedMultiplier: 0.35,
    yPosition: 0.6,
    elements: [],
    opacity: 0.6
  },

  // 4. Clouds (scattered)
  {
    name: 'clouds',
    speedMultiplier: 0.5,
    yPosition: 0.2,
    elements: [],
    opacity: 0.7
  },

  // 5. Trees/bushes (mid-ground)
  {
    name: 'vegetation',
    speedMultiplier: 0.7,
    yPosition: 0.75,
    elements: [],
    opacity: 0.8
  },

  // 6. Ground (1.0x speed - with pipes)

  // 7. Foreground grass tufts
  {
    name: 'foreground',
    speedMultiplier: 1.1,
    yPosition: 0.92,
    elements: [],
    opacity: 1.0
  }
];
```

### D2.2 Dynamic Mountain Silhouettes

```typescript
const drawMountainLayer = (
  ctx: CanvasRenderingContext2D,
  offset: number,
  environment: Environment
) => {
  const mountainColor = ENVIRONMENT_COLORS[environment].mountain;
  const layerOffset = offset * 0.2; // 20% parallax speed

  ctx.fillStyle = mountainColor;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.7);

  // Generate mountain peaks with noise
  for (let x = 0; x <= canvas.width + 100; x += 50) {
    const noiseX = (x + layerOffset) * 0.01;
    const peakHeight = 40 + Math.sin(noiseX) * 30 + Math.sin(noiseX * 2.3) * 15;
    ctx.lineTo(x, canvas.height * 0.55 - peakHeight);
  }

  ctx.lineTo(canvas.width + 100, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();
};
```

**Tasks:**
- [ ] D2.1.1 Create ParallaxLayer interface
- [ ] D2.1.2 Define 7 parallax layers
- [ ] D2.1.3 Implement layer offset calculation
- [ ] D2.2.1 Create drawMountainLayer function
- [ ] D2.2.2 Add procedural peak generation
- [ ] D2.2.3 Environment-specific mountain colors

### D2.3 Volumetric Clouds

```typescript
interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  speed: number;
  puffs: CloudPuff[];
}

interface CloudPuff {
  offsetX: number;
  offsetY: number;
  radius: number;
}

const generateCloud = (x: number, y: number): Cloud => {
  const width = 80 + Math.random() * 60;
  const height = 30 + Math.random() * 20;

  // Generate 4-7 overlapping puffs for fluffy look
  const puffCount = 4 + Math.floor(Math.random() * 4);
  const puffs: CloudPuff[] = [];

  for (let i = 0; i < puffCount; i++) {
    puffs.push({
      offsetX: (Math.random() - 0.5) * width * 0.8,
      offsetY: (Math.random() - 0.5) * height * 0.5,
      radius: height * 0.3 + Math.random() * height * 0.3
    });
  }

  return {
    x, y, width, height,
    opacity: 0.5 + Math.random() * 0.3,
    speed: 0.3 + Math.random() * 0.4,
    puffs
  };
};

const drawCloud = (ctx: CanvasRenderingContext2D, cloud: Cloud, environment: Environment) => {
  const cloudColor = environment === 'night' ? '#2a3a5a' :
                     environment === 'storm' ? '#5a6a7a' : '#FFFFFF';

  ctx.save();
  ctx.globalAlpha = cloud.opacity;

  cloud.puffs.forEach(puff => {
    const gradient = ctx.createRadialGradient(
      cloud.x + puff.offsetX, cloud.y + puff.offsetY, 0,
      cloud.x + puff.offsetX, cloud.y + puff.offsetY, puff.radius
    );
    gradient.addColorStop(0, cloudColor);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x + puff.offsetX, cloud.y + puff.offsetY, puff.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};
```

**Tasks:**
- [ ] D2.3.1 Create Cloud and CloudPuff interfaces
- [ ] D2.3.2 Implement generateCloud function
- [ ] D2.3.3 Implement drawCloud with radial gradients
- [ ] D2.3.4 Add cloud parallax movement
- [ ] D2.3.5 Environment-specific cloud colors

### D2.4 Atmospheric Light Rays (Sunset/Day)

```typescript
const drawLightRays = (ctx: CanvasRenderingContext2D, environment: Environment) => {
  if (environment !== 'day' && environment !== 'sunset') return;

  const sunX = canvas.width * 0.85;
  const sunY = environment === 'day' ? canvas.height * 0.15 : canvas.height * 0.35;
  const rayCount = 6;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 0.5 + Math.PI * 0.25;
    const rayLength = canvas.width * 0.8;

    const gradient = ctx.createLinearGradient(
      sunX, sunY,
      sunX + Math.cos(angle) * rayLength,
      sunY + Math.sin(angle) * rayLength
    );

    const rayColor = environment === 'sunset' ? 'rgba(255, 200, 100, 0.15)'
                                               : 'rgba(255, 255, 200, 0.1)';
    gradient.addColorStop(0, rayColor);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(
      sunX + Math.cos(angle - 0.05) * rayLength,
      sunY + Math.sin(angle - 0.05) * rayLength
    );
    ctx.lineTo(
      sunX + Math.cos(angle + 0.05) * rayLength,
      sunY + Math.sin(angle + 0.05) * rayLength
    );
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};
```

**Tasks:**
- [ ] D2.4.1 Implement drawLightRays function
- [ ] D2.4.2 Add sun position calculation
- [ ] D2.4.3 Animate ray rotation subtly
- [ ] D2.4.4 Environment-specific ray colors

### D2.5 Enhanced Ground with Texture

```typescript
const drawEnhancedGround = (ctx: CanvasRenderingContext2D, offset: number, environment: Environment) => {
  const groundY = canvas.height - 20;
  const colors = ENVIRONMENT_COLORS[environment];

  // Main ground
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, groundY, canvas.width, 20);

  // Grass layer
  ctx.fillStyle = colors.grass;
  ctx.fillRect(0, groundY, canvas.width, 5);

  // Grass tufts (foreground parallax)
  const tuftOffset = offset * 1.1;
  ctx.fillStyle = colors.grassDark || colors.grass;

  for (let x = -30; x < canvas.width + 30; x += 25) {
    const tuftX = x - (tuftOffset % 25);
    const tuftHeight = 6 + Math.sin(tuftX * 0.3) * 3;

    // Triangle grass tuft
    ctx.beginPath();
    ctx.moveTo(tuftX, groundY);
    ctx.lineTo(tuftX + 4, groundY - tuftHeight);
    ctx.lineTo(tuftX + 8, groundY);
    ctx.fill();
  }

  // Subtle texture overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let x = 0; x < canvas.width; x += 4) {
    if (Math.random() > 0.7) {
      ctx.fillRect(x, groundY + 5, 2, 2);
    }
  }
};
```

**Tasks:**
- [ ] D2.5.1 Create drawEnhancedGround function
- [ ] D2.5.2 Add grass tuft parallax
- [ ] D2.5.3 Add subtle texture dots
- [ ] D2.5.4 Environment-specific ground colors

---

## Phase D3: MODERN PIPE DESIGN (10 tasks)

### D3.1 Gradient Pipes with Lighting

```typescript
const PIPE_DESIGN = {
  width: 52,
  capExtension: 5,
  capHeight: 20,
  borderRadius: 4,
  highlightWidth: 8,
  shadowWidth: 6
};

const drawModernPipe = (
  ctx: CanvasRenderingContext2D,
  pipe: Pipe,
  environment: Environment
) => {
  const colors = getPipeColors(environment);
  const { x, gapY } = pipe;

  // Top pipe
  drawPipeSection(ctx, x, 0, gapY, colors, 'top');

  // Bottom pipe
  drawPipeSection(ctx, x, gapY + PIPE_GAP, canvas.height - 20 - (gapY + PIPE_GAP), colors, 'bottom');
};

const drawPipeSection = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  colors: PipeColors,
  position: 'top' | 'bottom'
) => {
  const capY = position === 'top' ? y + height - PIPE_DESIGN.capHeight : y;
  const bodyY = position === 'top' ? y : y + PIPE_DESIGN.capHeight;
  const bodyHeight = height - PIPE_DESIGN.capHeight;

  // Pipe body gradient
  const bodyGradient = ctx.createLinearGradient(x, 0, x + PIPE_DESIGN.width, 0);
  bodyGradient.addColorStop(0, colors.dark);
  bodyGradient.addColorStop(0.3, colors.main);
  bodyGradient.addColorStop(0.7, colors.main);
  bodyGradient.addColorStop(1, colors.dark);

  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, bodyY, PIPE_DESIGN.width, bodyHeight);

  // Highlight stripe
  ctx.fillStyle = colors.highlight;
  ctx.fillRect(x + 8, bodyY, PIPE_DESIGN.highlightWidth, bodyHeight);

  // Pipe cap (wider)
  const capX = x - PIPE_DESIGN.capExtension;
  const capWidth = PIPE_DESIGN.width + PIPE_DESIGN.capExtension * 2;

  const capGradient = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
  capGradient.addColorStop(0, colors.capDark);
  capGradient.addColorStop(0.3, colors.capMain);
  capGradient.addColorStop(0.7, colors.capMain);
  capGradient.addColorStop(1, colors.capDark);

  ctx.fillStyle = capGradient;
  roundRect(ctx, capX, capY, capWidth, PIPE_DESIGN.capHeight, PIPE_DESIGN.borderRadius);
  ctx.fill();

  // Cap highlight
  ctx.fillStyle = colors.capHighlight;
  ctx.fillRect(capX + 6, capY + 3, capWidth - 12, 4);
};

const getPipeColors = (environment: Environment): PipeColors => {
  switch (environment) {
    case 'night':
    case 'storm':
      return {
        main: '#1B5E20',
        dark: '#0D3D12',
        highlight: 'rgba(255, 255, 255, 0.1)',
        capMain: '#1A4D1A',
        capDark: '#0A2D0A',
        capHighlight: 'rgba(255, 255, 255, 0.08)'
      };
    default:
      return {
        main: '#2E7D32',
        dark: '#1B5E20',
        highlight: 'rgba(255, 255, 255, 0.15)',
        capMain: '#256029',
        capDark: '#1A4D1A',
        capHighlight: 'rgba(255, 255, 255, 0.12)'
      };
  }
};
```

**Tasks:**
- [ ] D3.1.1 Create PIPE_DESIGN constants
- [ ] D3.1.2 Implement drawModernPipe function
- [ ] D3.1.3 Add gradient body with lighting
- [ ] D3.1.4 Add pipe cap with rounded corners
- [ ] D3.1.5 Environment-specific pipe colors

### D3.2 Gap Safe Zone Glow

```typescript
const drawGapHighlight = (ctx: CanvasRenderingContext2D, pipe: Pipe, birdX: number) => {
  const distance = pipe.x - birdX;

  // Only show when approaching
  if (distance > 200 || distance < 0) return;

  const intensity = 1 - (distance / 200);
  const gapCenterY = pipe.gapY + PIPE_GAP / 2;

  // Radial glow in gap
  const gradient = ctx.createRadialGradient(
    pipe.x + PIPE_DESIGN.width / 2, gapCenterY, 0,
    pipe.x + PIPE_DESIGN.width / 2, gapCenterY, PIPE_GAP / 2
  );
  gradient.addColorStop(0, `rgba(100, 255, 100, ${intensity * 0.2})`);
  gradient.addColorStop(0.7, `rgba(100, 255, 100, ${intensity * 0.1})`);
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(pipe.x - 10, pipe.gapY, PIPE_DESIGN.width + 20, PIPE_GAP);
};
```

**Tasks:**
- [ ] D3.2.1 Implement drawGapHighlight
- [ ] D3.2.2 Intensity based on distance
- [ ] D3.2.3 Integrate into render loop

---

## Phase D4: PREMIUM UI DESIGN (12 tasks)

### D4.1 Modern Score Display

```typescript
const SCORE_UI = {
  fontSize: 56,
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 700,
  letterSpacing: 2,
  shadowOffset: 3,
  shadowBlur: 4,
  glowOnMilestone: true
};

const drawScore = (ctx: CanvasRenderingContext2D, score: number, isMilestone: boolean) => {
  const scoreText = score.toString();
  const x = canvas.width / 2;
  const y = 60;

  ctx.save();
  ctx.font = `${SCORE_UI.fontWeight} ${SCORE_UI.fontSize}px ${SCORE_UI.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow effect on milestone
  if (isMilestone && SCORE_UI.glowOnMilestone) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillText(scoreText, x + SCORE_UI.shadowOffset, y + SCORE_UI.shadowOffset);

  // Main text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(scoreText, x, y);

  // Subtle outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeText(scoreText, x, y);

  ctx.restore();
};
```

**Tasks:**
- [ ] D4.1.1 Create SCORE_UI config
- [ ] D4.1.2 Implement modern drawScore
- [ ] D4.1.3 Add shadow and outline
- [ ] D4.1.4 Add milestone glow effect

### D4.2 Animated Score Popup

```typescript
interface ScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  startY: number;
  scale: number;
  alpha: number;
  color: string;
  age: number;
  maxAge: number;
}

const createScorePopup = (text: string, x: number, y: number, type: 'normal' | 'bonus' | 'milestone'): ScorePopup => {
  const configs = {
    normal: { color: '#FFD700', scale: 1.0, maxAge: 800 },
    bonus: { color: '#00FF88', scale: 1.3, maxAge: 1000 },
    milestone: { color: '#FF6B6B', scale: 1.6, maxAge: 1200 }
  };

  const config = configs[type];

  return {
    id: `popup-${Date.now()}`,
    text,
    x: x + (Math.random() - 0.5) * 20,
    y,
    startY: y,
    scale: config.scale,
    alpha: 1,
    color: config.color,
    age: 0,
    maxAge: config.maxAge
  };
};

const drawScorePopup = (ctx: CanvasRenderingContext2D, popup: ScorePopup) => {
  const progress = popup.age / popup.maxAge;

  // Eased movement (arc upward then slow)
  const yOffset = -60 * easeOutCubic(progress);
  const currentY = popup.startY + yOffset;

  // Scale animation (pop in then shrink)
  const scaleProgress = progress < 0.2
    ? easeOutBack(progress / 0.2)
    : 1 - (progress - 0.2) * 0.3;
  const currentScale = popup.scale * scaleProgress;

  // Alpha fade
  const currentAlpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

  ctx.save();
  ctx.globalAlpha = currentAlpha;
  ctx.font = `bold ${24 * currentScale}px 'Roboto', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = popup.color;

  // Glow
  ctx.shadowColor = popup.color;
  ctx.shadowBlur = 8;

  ctx.fillText(popup.text, popup.x, currentY);
  ctx.restore();
};
```

**Tasks:**
- [ ] D4.2.1 Create ScorePopup interface
- [ ] D4.2.2 Implement createScorePopup with types
- [ ] D4.2.3 Implement drawScorePopup with easing
- [ ] D4.2.4 Add pop-in scale animation
- [ ] D4.2.5 Add glow effect

### D4.3 Modern Game Over Screen

```typescript
const drawGameOverScreen = (ctx: CanvasRenderingContext2D, stats: GameStats, animProgress: number) => {
  // Darken background
  ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * animProgress})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card background (slide up)
  const cardY = canvas.height * 0.3 + (1 - animProgress) * 100;
  const cardWidth = canvas.width * 0.85;
  const cardHeight = 280;
  const cardX = (canvas.width - cardWidth) / 2;

  // Card shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  roundRect(ctx, cardX + 4, cardY + 4, cardWidth, cardHeight, 16);
  ctx.fill();

  // Card
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 16);
  ctx.fill();

  // Title
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 36px Roboto';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, cardY + 50);

  // Score
  ctx.fillStyle = '#FF6B00';
  ctx.font = 'bold 64px Roboto';
  ctx.fillText(stats.score.toString(), canvas.width / 2, cardY + 130);

  ctx.fillStyle = '#888888';
  ctx.font = '18px Roboto';
  ctx.fillText('PIPES', canvas.width / 2, cardY + 155);

  // Best score
  ctx.fillStyle = stats.isNewBest ? '#FFD700' : '#AAAAAA';
  ctx.font = 'bold 20px Roboto';
  ctx.fillText(
    stats.isNewBest ? '🏆 NEW BEST!' : `Best: ${stats.bestScore}`,
    canvas.width / 2,
    cardY + 190
  );

  // Retry button
  const buttonY = cardY + 220;
  const buttonWidth = 140;
  const buttonHeight = 44;
  const buttonX = (canvas.width - buttonWidth) / 2;

  ctx.fillStyle = '#FF6B00';
  roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 22);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Roboto';
  ctx.fillText('TAP TO RETRY', canvas.width / 2, buttonY + 28);
};
```

**Tasks:**
- [ ] D4.3.1 Implement drawGameOverScreen
- [ ] D4.3.2 Add card slide-up animation
- [ ] D4.3.3 Add shadow and rounded corners
- [ ] D4.3.4 Style retry button
- [ ] D4.3.5 Add new best celebration

---

## Phase D5: ATMOSPHERIC EFFECTS (8 tasks)

### D5.1 Dynamic Vignette

```typescript
const drawVignette = (ctx: CanvasRenderingContext2D, environment: Environment, intensity: number = 1) => {
  const vignetteColors = {
    day: 'rgba(0, 0, 0, 0.15)',
    sunset: 'rgba(50, 0, 0, 0.2)',
    night: 'rgba(0, 0, 30, 0.3)',
    storm: 'rgba(20, 20, 30, 0.35)'
  };

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.7
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, vignetteColors[environment]);

  ctx.globalAlpha = intensity;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
};
```

### D5.2 Rain Effect (Storm)

```typescript
interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

const RAIN_CONFIG = {
  dropCount: 100,
  minLength: 10,
  maxLength: 25,
  minSpeed: 8,
  maxSpeed: 15,
  angle: 0.1 // Slight angle
};

const rainDropsRef = useRef<RainDrop[]>([]);

const initRain = () => {
  rainDropsRef.current = [];
  for (let i = 0; i < RAIN_CONFIG.dropCount; i++) {
    rainDropsRef.current.push(createRainDrop());
  }
};

const createRainDrop = (): RainDrop => ({
  x: Math.random() * (canvas.width + 50),
  y: Math.random() * canvas.height - canvas.height,
  length: RAIN_CONFIG.minLength + Math.random() * (RAIN_CONFIG.maxLength - RAIN_CONFIG.minLength),
  speed: RAIN_CONFIG.minSpeed + Math.random() * (RAIN_CONFIG.maxSpeed - RAIN_CONFIG.minSpeed),
  opacity: 0.3 + Math.random() * 0.4
});

const drawRain = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
  ctx.lineWidth = 1;

  rainDropsRef.current.forEach(drop => {
    ctx.globalAlpha = drop.opacity;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(
      drop.x + drop.length * RAIN_CONFIG.angle,
      drop.y + drop.length
    );
    ctx.stroke();

    // Update
    drop.y += drop.speed;
    drop.x += drop.speed * RAIN_CONFIG.angle;

    // Reset if off screen
    if (drop.y > canvas.height) {
      drop.y = -drop.length;
      drop.x = Math.random() * (canvas.width + 50);
    }
  });

  ctx.globalAlpha = 1;
};
```

**Tasks:**
- [ ] D5.1.1 Implement drawVignette
- [ ] D5.1.2 Environment-specific vignette colors
- [ ] D5.2.1 Create RainDrop interface
- [ ] D5.2.2 Implement rain particle system
- [ ] D5.2.3 Add wind angle to rain
- [ ] D5.2.4 Only show during storm environment

### D5.3 Lightning Flash (Storm)

```typescript
const triggerLightning = () => {
  // Random chance per frame during storm
  if (environment !== 'storm' || Math.random() > 0.002) return;

  // Flash sequence: bright → dim → bright → fade
  setLightningAlpha(0.8);

  setTimeout(() => setLightningAlpha(0.2), 50);
  setTimeout(() => setLightningAlpha(0.6), 100);
  setTimeout(() => setLightningAlpha(0), 200);

  // Thunder sound after delay
  setTimeout(() => {
    playThunderSound();
    triggerScreenShake(3, 200);
  }, 300 + Math.random() * 500);
};

const drawLightning = (ctx: CanvasRenderingContext2D) => {
  if (lightningAlpha <= 0) return;

  ctx.fillStyle = `rgba(230, 230, 250, ${lightningAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};
```

**Tasks:**
- [ ] D5.3.1 Implement triggerLightning
- [ ] D5.3.2 Add multi-flash sequence
- [ ] D5.3.3 Add delayed thunder + shake

---

## Design Implementation Priority

1. **D1: Character Personality** - Makes the orange lovable
2. **D3: Modern Pipes** - Clean, professional look
3. **D4: Premium UI** - Score and game over polish
4. **D2: Environment Depth** - Parallax and atmosphere
5. **D5: Atmospheric Effects** - Final polish layer

---

## Design Metrics

| Element | Before | After |
|---------|--------|-------|
| Character Personality | Basic | Expressive (eye tracking, expressions) |
| Background Depth | 2 layers | 7 parallax layers |
| Pipe Design | Flat colors | Gradients + lighting |
| UI Polish | Basic text | Modern cards + animations |
| Atmosphere | None | Vignette + weather effects |

---

**Total Design Tasks: 56**
**Estimated Time: 6-8 hours**
**Impact: Transforms game from "functional" to "premium"**
