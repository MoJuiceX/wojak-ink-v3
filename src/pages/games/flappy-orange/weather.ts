/**
 * FlappyOrange Weather System
 *
 * Pure functions for creating and updating weather particles.
 * All functions return new arrays or updated state without side effects.
 */

import type {
  RainDrop,
  RainSplash,
  Snowflake,
  FallingLeaf,
  BackgroundBird,
  LightningBolt,
  WeatherState,
} from './types';
import { WEATHER_CONFIG, WEATHER_SEQUENCES, CYCLE_DURATION_MS, type WeatherType } from './config';

// ============================================
// RAIN FUNCTIONS
// ============================================

/**
 * Create new rain drops
 * @param count - Number of drops to create
 * @param canvasWidth - Canvas width for positioning
 * @param canvasHeight - Canvas height for positioning
 * @param staggerY - If true, spawn at random Y positions (for instant fill)
 * @returns Array of new rain drops
 */
export function createRainDrops(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  staggerY: boolean = false
): RainDrop[] {
  const drops: RainDrop[] = [];
  for (let i = 0; i < count; i++) {
    drops.push({
      x: Math.random() * canvasWidth * 1.2 - canvasWidth * 0.1,
      y: staggerY ? Math.random() * canvasHeight : -10 - Math.random() * 50,
      length: 12 + Math.random() * 12,
      speed: 10 + Math.random() * 4,
      opacity: 0.4 + Math.random() * 0.3,
      foreground: Math.random() < 0.4, // 40% render in front of pipes
    });
  }
  return drops;
}

/**
 * Update rain drops and generate splashes when hitting ground
 * @param drops - Current rain drops array
 * @param canvasHeight - Canvas height for ground check
 * @param groundY - Y position of ground
 * @param maxSplashes - Maximum number of splashes to allow
 * @returns Object with updated drops and new splashes
 */
export function updateRainDrops(
  drops: RainDrop[],
  _canvasHeight: number,
  groundY: number,
  maxSplashes: number = 50
): { drops: RainDrop[]; newSplashes: RainSplash[] } {
  const newSplashes: RainSplash[] = [];
  let splashCount = 0;

  const updatedDrops = drops.filter(drop => {
    drop.y += drop.speed;
    drop.x -= 2; // Wind effect

    // Spawn splash when hitting ground
    if (drop.y >= groundY && splashCount < maxSplashes) {
      // Spawn 2-3 tiny splash particles
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        newSplashes.push({
          x: drop.x,
          y: groundY,
          vx: (Math.random() - 0.5) * 3,
          vy: -1 - Math.random() * 2,
          alpha: 0.6,
          size: 1 + Math.random(),
        });
        splashCount++;
      }
    }

    return drop.y < groundY;
  });

  return { drops: updatedDrops, newSplashes };
}

/**
 * Update rain splashes (gravity + fade)
 * @param splashes - Current splashes array
 * @returns Updated splashes array (modifies in place for performance)
 */
export function updateRainSplashes(splashes: RainSplash[]): RainSplash[] {
  return splashes.filter(splash => {
    splash.x += splash.vx;
    splash.y += splash.vy;
    splash.vy += 0.2; // Gravity
    splash.alpha -= 0.05;
    return splash.alpha > 0;
  });
}

/**
 * Add new rain drops to existing array with cap
 * @param existing - Existing rain drops
 * @param newDrops - New drops to add
 * @param maxDrops - Maximum drops to keep
 * @returns Combined array capped at maxDrops
 */
export function addRainDropsWithCap(
  existing: RainDrop[],
  newDrops: RainDrop[],
  maxDrops: number = WEATHER_CONFIG.MAX_RAIN_DROPS
): RainDrop[] {
  const combined = [...existing, ...newDrops];
  if (combined.length > maxDrops) {
    return combined.slice(-maxDrops);
  }
  return combined;
}

// ============================================
// SNOW FUNCTIONS
// ============================================

/**
 * Create new snowflakes
 * @param count - Number of snowflakes to create
 * @param canvasWidth - Canvas width for positioning
 * @param canvasHeight - Canvas height for positioning (used with staggerY)
 * @param staggerY - If true, spawn at random Y positions (for instant fill)
 * @param maxSnowflakes - Maximum snowflakes allowed
 * @param currentCount - Current number of snowflakes
 * @returns Array of new snowflakes
 */
export function createSnowflakes(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  staggerY: boolean = false,
  maxSnowflakes: number = WEATHER_CONFIG.MAX_SNOWFLAKES,
  currentCount: number = 0
): Snowflake[] {
  const snowflakes: Snowflake[] = [];
  const availableSlots = maxSnowflakes - currentCount;

  for (let i = 0; i < count && i < availableSlots; i++) {
    snowflakes.push({
      x: Math.random() * canvasWidth,
      y: staggerY ? Math.random() * canvasHeight : -10,
      size: WEATHER_CONFIG.SNOW_SIZE.min +
        Math.random() * (WEATHER_CONFIG.SNOW_SIZE.max - WEATHER_CONFIG.SNOW_SIZE.min),
      speed: WEATHER_CONFIG.SNOW_FALL_SPEED.min +
        Math.random() * (WEATHER_CONFIG.SNOW_FALL_SPEED.max - WEATHER_CONFIG.SNOW_FALL_SPEED.min),
      drift: Math.random() * Math.PI * 2,
      driftPhase: Math.random() * Math.PI * 2,
      opacity: 0.5 + Math.random() * 0.5,
      foreground: Math.random() < 0.4, // 40% in foreground
    });
  }
  return snowflakes;
}

/**
 * Update snowflakes with wind and drift
 * @param snowflakes - Current snowflakes array
 * @param deltaTime - Frame delta time for consistent animation
 * @param windSpeed - Current wind speed
 * @param canvasWidth - Canvas width for bounds check
 * @param canvasHeight - Canvas height for bounds check
 * @returns Updated snowflakes array (modifies in place for performance)
 */
export function updateSnowflakes(
  snowflakes: Snowflake[],
  deltaTime: number,
  windSpeed: number,
  canvasWidth: number,
  canvasHeight: number
): Snowflake[] {
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    const flake = snowflakes[i];
    flake.y += flake.speed * deltaTime;
    flake.driftPhase += 0.02 * deltaTime;
    flake.x += Math.sin(flake.driftPhase) * 0.5 + windSpeed * 0.3 * deltaTime;

    if (flake.y > canvasHeight || flake.x < -20 || flake.x > canvasWidth + 20) {
      snowflakes.splice(i, 1);
    }
  }
  return snowflakes;
}

/**
 * Add new snowflakes to existing array
 * @param existing - Existing snowflakes
 * @param newFlakes - New snowflakes to add
 * @returns Combined array
 */
export function addSnowflakes(
  existing: Snowflake[],
  newFlakes: Snowflake[]
): Snowflake[] {
  return [...existing, ...newFlakes];
}

// ============================================
// FALLING LEAVES FUNCTIONS
// ============================================

/**
 * Create a single falling leaf
 * @param canvasWidth - Canvas width for positioning
 * @returns New falling leaf or null if at capacity
 */
export function createFallingLeaf(canvasWidth: number): FallingLeaf {
  return {
    x: Math.random() * canvasWidth,
    y: -10,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    size: 4 + Math.random() * 4,
    speed: 0.5 + Math.random() * 1,
    drift: Math.random() * Math.PI * 2,
    driftPhase: Math.random() * Math.PI * 2,
    color: WEATHER_CONFIG.LEAF_COLORS[
      Math.floor(Math.random() * WEATHER_CONFIG.LEAF_COLORS.length)
    ],
  };
}

/**
 * Create multiple falling leaves
 * @param count - Number of leaves to create
 * @param canvasWidth - Canvas width for positioning
 * @param maxLeaves - Maximum leaves allowed
 * @param currentCount - Current number of leaves
 * @returns Array of new leaves
 */
export function createFallingLeaves(
  count: number,
  canvasWidth: number,
  maxLeaves: number = WEATHER_CONFIG.MAX_LEAVES,
  currentCount: number = 0
): FallingLeaf[] {
  const leaves: FallingLeaf[] = [];
  const availableSlots = maxLeaves - currentCount;

  for (let i = 0; i < count && i < availableSlots; i++) {
    leaves.push(createFallingLeaf(canvasWidth));
  }
  return leaves;
}

/**
 * Update falling leaves with wind and drift
 * @param leaves - Current leaves array
 * @param deltaTime - Frame delta time
 * @param windSpeed - Current wind speed
 * @param canvasHeight - Canvas height for bounds check
 * @returns Updated leaves array (modifies in place for performance)
 */
export function updateFallingLeaves(
  leaves: FallingLeaf[],
  deltaTime: number,
  windSpeed: number,
  canvasHeight: number
): FallingLeaf[] {
  for (let i = leaves.length - 1; i >= 0; i--) {
    const leaf = leaves[i];
    leaf.y += leaf.speed * deltaTime;
    leaf.driftPhase += 0.03 * deltaTime;
    leaf.x += Math.sin(leaf.driftPhase) * 0.8 + windSpeed * 0.4 * deltaTime;
    leaf.rotation += leaf.rotationSpeed * deltaTime;

    if (leaf.y > canvasHeight + 10) {
      leaves.splice(i, 1);
    }
  }
  return leaves;
}

/**
 * Add new leaves to existing array
 * @param existing - Existing leaves
 * @param newLeaves - New leaves to add
 * @returns Combined array
 */
export function addFallingLeaves(
  existing: FallingLeaf[],
  newLeaves: FallingLeaf[]
): FallingLeaf[] {
  return [...existing, ...newLeaves];
}

// ============================================
// BIRD FLOCK FUNCTIONS
// ============================================

/**
 * Create a flock of background birds
 * @param canvasWidth - Canvas width for positioning
 * @param canvasHeight - Canvas height for positioning
 * @returns Array of background birds (empty if flock shouldn't spawn)
 */
export function createBirdFlock(
  canvasWidth: number,
  canvasHeight: number
): BackgroundBird[] {
  const birds: BackgroundBird[] = [];

  const flockSize = WEATHER_CONFIG.FLOCK_SIZE.min +
    Math.floor(Math.random() * (WEATHER_CONFIG.FLOCK_SIZE.max - WEATHER_CONFIG.FLOCK_SIZE.min));
  const baseY = 50 + Math.random() * (canvasHeight * 0.4);
  const baseSpeed = WEATHER_CONFIG.BIRD_SPEED.min +
    Math.random() * (WEATHER_CONFIG.BIRD_SPEED.max - WEATHER_CONFIG.BIRD_SPEED.min);
  const direction = Math.random() > 0.5 ? 1 : -1;
  const startX = direction > 0 ? -50 : canvasWidth + 50;

  for (let i = 0; i < flockSize; i++) {
    birds.push({
      x: startX - (i * 20 * direction) + (Math.random() - 0.5) * 15,
      y: baseY + (i % 2 === 0 ? i * 8 : -i * 8),
      wingPhase: Math.random() * Math.PI * 2,
      speed: baseSpeed * direction,
      size: 3 + Math.random() * 2,
      yOffset: Math.sin(i) * 10,
    });
  }

  return birds;
}

/**
 * Update background birds
 * @param birds - Current birds array
 * @param deltaTime - Frame delta time
 * @param canvasWidth - Canvas width for bounds check
 * @returns Updated birds array (modifies in place for performance)
 */
export function updateBackgroundBirds(
  birds: BackgroundBird[],
  deltaTime: number,
  canvasWidth: number
): BackgroundBird[] {
  for (let i = birds.length - 1; i >= 0; i--) {
    const bird = birds[i];
    bird.x += bird.speed * deltaTime;
    bird.wingPhase += 0.3 * deltaTime;
    bird.y += Math.sin(bird.wingPhase * 0.5) * 0.2;

    if ((bird.speed > 0 && bird.x > canvasWidth + 100) ||
        (bird.speed < 0 && bird.x < -100)) {
      birds.splice(i, 1);
    }
  }
  return birds;
}

/**
 * Check if a bird flock should spawn
 * @param currentBirdCount - Current number of birds
 * @returns True if flock can spawn
 */
export function canSpawnBirdFlock(currentBirdCount: number): boolean {
  return currentBirdCount === 0; // Only one flock at a time
}

// ============================================
// TIME OF DAY FUNCTIONS
// ============================================

export type TimeOfDayPhase = 'day' | 'night' | 'dawn' | 'dusk';

/**
 * Get current time-of-day phase based on cycle progress
 * @param cycleTime - Current cycle time in ms
 * @returns The current time of day phase
 */
export function getTimeOfDayPhase(cycleTime: number): TimeOfDayPhase {
  const progress = cycleTime / CYCLE_DURATION_MS;
  if (progress < 0.5) {
    const dayProgress = progress / 0.5;
    if (dayProgress < 0.12) return 'dawn';
    if (dayProgress > 0.85) return 'dusk';
    return 'day';
  } else {
    const nightProgress = (progress - 0.5) / 0.5;
    if (nightProgress > 0.9) return 'dawn';
    return 'night';
  }
}

// ============================================
// WEATHER STATE MACHINE
// ============================================

/**
 * Result of weather state machine update
 */
export interface WeatherUpdateResult {
  /** Whether fog timer should be started */
  startFog: boolean;
  /** Duration for fog timer if starting */
  fogDuration: number;
}

/**
 * Update the weather state machine - handles weather sequences and transitions
 * This is the core state machine logic that advances weather through sequences.
 *
 * @param weather - Current weather state (mutated in place)
 * @param weatherTimer - Current weather timer value in ms
 * @param fogTimer - Current fog timer value in ms
 * @param deltaTime - Frame delta time (normalized to 60fps = 1)
 * @returns Object with updated timer values and fog start info
 */
export function updateWeatherStateMachine(
  weather: WeatherState,
  weatherTimer: number,
  fogTimer: number,
  deltaTime: number
): { weatherTimer: number; fogTimer: number; result: WeatherUpdateResult } {
  const deltaMs = deltaTime * 16.67;
  let newWeatherTimer = weatherTimer - deltaMs;
  let newFogTimer = fogTimer;
  const result: WeatherUpdateResult = {
    startFog: false,
    fogDuration: 0,
  };

  // Check if it's time to advance in the sequence
  if (newWeatherTimer <= 0 && !weather.nextWeather) {
    // Move to next step in sequence
    weather.sequenceIndex++;

    // Check if sequence is complete
    if (weather.sequenceIndex >= weather.currentSequence.length) {
      // Sequence done - enter clear buffer period
      if (!weather.inClearBuffer) {
        weather.inClearBuffer = true;
        weather.nextWeather = 'clear';
        weather.transitionProgress = 0;
        newWeatherTimer = WEATHER_CONFIG.CLEAR_BUFFER_DURATION;
      } else {
        // Clear buffer done - pick a new weather sequence
        weather.inClearBuffer = false;
        const rand = Math.random();
        const chances = WEATHER_CONFIG.EVENT_CHANCES;
        let sequenceKey: string;

        if (rand < chances.rain) {
          sequenceKey = 'rain';
        } else if (rand < chances.rain + chances.storm) {
          sequenceKey = 'storm';
        } else if (rand < chances.rain + chances.storm + chances.snow) {
          sequenceKey = 'snow';
        } else {
          sequenceKey = 'clear';
        }

        weather.currentSequence = [...WEATHER_SEQUENCES[sequenceKey]];
        weather.sequenceIndex = 0;
        weather.nextWeather = weather.currentSequence[0];
        weather.transitionProgress = 0;
        newWeatherTimer = WEATHER_CONFIG.MIN_WEATHER_DURATION +
          Math.random() * (WEATHER_CONFIG.MAX_WEATHER_DURATION - WEATHER_CONFIG.MIN_WEATHER_DURATION);

        // Random chance to start fog overlay with new sequence
        if (weather.fogIntensity === 0 && Math.random() < WEATHER_CONFIG.FOG_CHANCE) {
          result.startFog = true;
          result.fogDuration = WEATHER_CONFIG.FOG_DURATION.min +
            Math.random() * (WEATHER_CONFIG.FOG_DURATION.max - WEATHER_CONFIG.FOG_DURATION.min);
        }
      }
    } else {
      // Advance to next weather in sequence
      const nextInSequence = weather.currentSequence[weather.sequenceIndex];
      if (nextInSequence !== weather.current) {
        weather.nextWeather = nextInSequence;
        weather.transitionProgress = 0;
      }
      newWeatherTimer = WEATHER_CONFIG.MIN_WEATHER_DURATION +
        Math.random() * (WEATHER_CONFIG.MAX_WEATHER_DURATION - WEATHER_CONFIG.MIN_WEATHER_DURATION);
    }
  }

  // Handle weather transitions (smooth fade between types)
  if (weather.nextWeather) {
    weather.transitionProgress += deltaMs / WEATHER_CONFIG.TRANSITION_DURATION;
    if (weather.transitionProgress >= 1) {
      weather.current = weather.nextWeather;
      weather.nextWeather = null;
      weather.transitionProgress = 1;
    }
  }

  // Ramp intensity up/down for precipitation weather (gradual ~5 seconds)
  const isPrecipitating = weather.current === 'rain' || weather.current === 'storm' || weather.current === 'snow';
  const targetIntensity = isPrecipitating ? 1 : 0;
  const intensityRampSpeed = 0.0004; // ~5 seconds to full intensity (slower, more natural)

  if (weather.intensity < targetIntensity) {
    weather.intensity = Math.min(targetIntensity, weather.intensity + intensityRampSpeed * deltaTime);
  } else if (weather.intensity > targetIntensity) {
    weather.intensity = Math.max(targetIntensity, weather.intensity - intensityRampSpeed * deltaTime);
  }

  // Handle fog overlay separately (can combine with any weather)
  // SLOW fade in/out over ~15-20 seconds
  if (newFogTimer > 0) {
    newFogTimer -= deltaMs;
    // Ramp fog in slowly
    weather.fogIntensity = Math.min(1, weather.fogIntensity + 0.0008 * deltaTime);
  } else {
    // Ramp fog out slowly
    weather.fogIntensity = Math.max(0, weather.fogIntensity - 0.0008 * deltaTime);
  }

  // Update wind (stronger during storm)
  const windChange = weather.current === 'storm' ? 0.03 : WEATHER_CONFIG.WIND_CHANGE_RATE;
  const maxWind = weather.current === 'storm' ? WEATHER_CONFIG.STORM_WIND_SPEED : WEATHER_CONFIG.MAX_WIND_SPEED;
  weather.windSpeed += (Math.random() - 0.5) * windChange;
  weather.windSpeed = Math.max(-maxWind, Math.min(maxWind, weather.windSpeed));

  return { weatherTimer: newWeatherTimer, fogTimer: newFogTimer, result };
}

/**
 * Update snow accumulation on ground
 * Snow edge scrolls left when snow stops (like ground is moving)
 *
 * @param weather - Current weather state
 * @param snowAccumulation - Current snow accumulation (0-1)
 * @param snowGroundEdge - Current snow ground edge X position
 * @param canvasWidth - Canvas width
 * @param isPlaying - Whether game is in playing state
 * @param deltaTime - Frame delta time
 * @returns Object with updated accumulation and edge values
 */
export function updateSnowAccumulation(
  weather: WeatherState,
  snowAccumulation: number,
  snowGroundEdge: number,
  canvasWidth: number,
  isPlaying: boolean,
  deltaTime: number
): { snowAccumulation: number; snowGroundEdge: number } {
  const isSnowing = weather.current === 'snow' && weather.intensity > 0.2;
  let newAccumulation = snowAccumulation;
  let newEdge = snowGroundEdge;

  if (isSnowing) {
    // Build up snow on ground (slower than snowflakes appear)
    newAccumulation = Math.min(1, newAccumulation + 0.0004 * deltaTime);
    // Keep snow edge at right side of screen while snowing
    newEdge = canvasWidth + 50;
  } else if (newEdge > -50 && isPlaying) {
    // Snow stopped AND game is playing - scroll the snow edge left with game speed
    const gameSpeed = 2.5 * deltaTime; // Match pipe speed
    newEdge -= gameSpeed;
    // Keep accumulation level for existing snow (doesn't fade, just scrolls off)
  }

  // Reset accumulation when all snow has scrolled off
  if (newEdge <= -50) {
    newAccumulation = 0;
  }

  return { snowAccumulation: newAccumulation, snowGroundEdge: newEdge };
}

/**
 * Debug: Set weather type directly
 * @param weather - Weather state to modify
 * @param type - Weather type to set
 */
export function setWeatherTypeDirect(weather: WeatherState, type: WeatherType): void {
  const isPrecipitating = type === 'rain' || type === 'storm' || type === 'snow';
  weather.current = type;
  // Start intensity at 0 for precipitation so it ramps up gradually
  weather.intensity = isPrecipitating ? 0 : 1;
  weather.transitionProgress = 1;
  weather.nextWeather = null;
}

// ============================================
// LIGHTNING BOLT FUNCTIONS
// ============================================

/**
 * Generate a lightning bolt with zigzag segments
 * @param canvasWidth - Canvas width for positioning
 * @param canvasHeight - Canvas height for positioning
 * @returns New lightning bolt
 */
export function generateLightningBolt(canvasWidth: number, canvasHeight: number): LightningBolt {
  const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  let x = canvasWidth * 0.3 + Math.random() * canvasWidth * 0.4;
  let y = 0;
  const endY = canvasHeight * 0.6 + Math.random() * canvasHeight * 0.3;

  while (y < endY) {
    const nextY = y + 15 + Math.random() * 25;
    const nextX = x + (Math.random() - 0.5) * 40;
    segments.push({ x1: x, y1: y, x2: nextX, y2: nextY });

    // Branch chance
    if (Math.random() < 0.3 && segments.length > 2) {
      const branchEndX = nextX + (Math.random() - 0.5) * 60;
      const branchEndY = nextY + 20 + Math.random() * 30;
      segments.push({ x1: nextX, y1: nextY, x2: branchEndX, y2: branchEndY });
    }

    x = nextX;
    y = nextY;
  }

  return { segments, alpha: 1, startTime: Date.now() };
}

/**
 * Update lightning bolts - fade out over time
 * @param bolts - Array of lightning bolts (mutated in place)
 * @returns Updated bolts array with expired bolts removed
 */
export function updateLightningBolts(bolts: LightningBolt[]): LightningBolt[] {
  const now = Date.now();
  for (let i = bolts.length - 1; i >= 0; i--) {
    const age = now - bolts[i].startTime;
    bolts[i].alpha = Math.max(0, 1 - age / 200);
    if (bolts[i].alpha <= 0) {
      bolts.splice(i, 1);
    }
  }
  return bolts;
}

/**
 * Check if lightning should trigger during a storm
 * @param weather - Current weather state
 * @param deltaTime - Frame delta time
 * @returns True if lightning should trigger
 */
export function shouldTriggerLightning(weather: WeatherState, deltaTime: number): boolean {
  const isStorm = weather.current === 'storm';
  return isStorm && weather.intensity > 0.3 && Math.random() < 0.008 * deltaTime;
}

/**
 * Generate lightning flash alpha sequence
 * Returns array of {delay, alpha} for setTimeout scheduling
 */
export function getLightningFlashSequence(): Array<{ delay: number; alpha: number }> {
  return [
    { delay: 0, alpha: 0.8 },
    { delay: 50, alpha: 0.2 },
    { delay: 100, alpha: 0.6 },
    { delay: 150, alpha: 0.1 },
    { delay: 200, alpha: 0.4 },
    { delay: 300, alpha: 0 },
  ];
}

/**
 * Get thunder effect delay and parameters
 * @returns Object with delay and effect parameters
 */
export function getThunderEffectParams(): { delay: number; shakeIntensity: number; shakeDuration: number; toneFreq: number; toneVolume: number; toneDuration: number } {
  return {
    delay: 400,
    shakeIntensity: 4,
    shakeDuration: 300,
    toneFreq: 60,
    toneVolume: 0.15,
    toneDuration: 400,
  };
}

// ============================================
// WEATHER PARTICLE SPAWNING HELPERS
// ============================================

/**
 * Calculate how many rain drops to spawn based on weather intensity
 * @param weather - Current weather state
 * @returns Number of drops to spawn
 */
export function calculateRainSpawnCount(weather: WeatherState): number {
  if (weather.current !== 'rain' && weather.current !== 'storm') return 0;
  if (weather.intensity <= 0) return 0;

  const isStorm = weather.current === 'storm';
  const baseDrops = isStorm ? 5 : 3;
  return Math.floor(weather.intensity * baseDrops) + (Math.random() < weather.intensity ? 1 : 0);
}

/**
 * Create a rain drop with weather-appropriate properties
 * @param canvasWidth - Canvas width for positioning
 * @param isStorm - Whether it's a storm (heavier rain)
 * @returns New rain drop
 */
export function createWeatherRainDrop(canvasWidth: number, isStorm: boolean): RainDrop {
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * 30,
    length: isStorm ? 18 + Math.random() * 12 : 15 + Math.random() * 10,
    speed: isStorm ? 12 + Math.random() * 8 : 10 + Math.random() * 6,
    opacity: 0.5 + Math.random() * 0.4,
    foreground: Math.random() < 0.4,
  };
}

/**
 * Calculate snow spawn chance based on weather intensity
 * @param weather - Current weather state
 * @param deltaTime - Frame delta time
 * @returns True if snow should spawn this frame
 */
export function shouldSpawnSnow(weather: WeatherState, deltaTime: number): boolean {
  if (weather.current !== 'snow' || weather.intensity <= 0) return false;
  const snowSpawnRate = 0.15 * weather.intensity * weather.intensity;
  return Math.random() < snowSpawnRate * deltaTime;
}

/**
 * Calculate how many snowflakes to spawn
 * @param weather - Current weather state
 * @returns Number of snowflakes to spawn
 */
export function calculateSnowSpawnCount(weather: WeatherState): number {
  return Math.ceil(3 * weather.intensity);
}
