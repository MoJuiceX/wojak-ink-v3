/**
 * Animation & Easing Library
 * Smooth transitions, tweening, and timing functions
 *
 * @example
 * import { easeOutCubic, createTween, Tween } from '@/lib/juice/animations';
 *
 * const tween = createTween(0, 100, 500, easeOutCubic);
 * const value = updateTween(tween, deltaTime);
 */

// ============================================
// EASING FUNCTIONS
// ============================================

/**
 * Linear - no easing
 */
export const linear = (t: number): number => t;

/**
 * Ease Out Cubic - decelerating to zero velocity
 * Great for: UI popups, score displays
 */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Ease In Cubic - accelerating from zero velocity
 * Great for: Exits, fade outs
 */
export const easeInCubic = (t: number): number => t * t * t;

/**
 * Ease In Out Cubic - acceleration then deceleration
 * Great for: Smooth transitions, camera movements
 */
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Ease Out Quad - lighter deceleration
 * Great for: Quick transitions
 */
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);

/**
 * Ease In Out Quad
 */
export const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * Ease Out Back - overshoots then returns (bouncy)
 * Great for: Pop-in effects, score popups, achievements
 */
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Ease In Back - anticipation before movement
 * Great for: Wind-up effects
 */
export const easeInBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

/**
 * Ease Out Elastic - bouncy spring effect
 * Great for: Playful popups, game elements
 */
export const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Ease Out Bounce - bouncing effect
 * Great for: Landing, impact reactions
 */
export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

/**
 * Ease In Expo - exponential acceleration
 * Great for: Dramatic starts
 */
export const easeInExpo = (t: number): number =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10);

/**
 * Ease Out Expo - exponential deceleration
 * Great for: Snappy stops
 */
export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

// Type for easing functions
export type EasingFunction = (t: number) => number;

// ============================================
// TWEEN SYSTEM
// ============================================

export interface Tween {
  startValue: number;
  endValue: number;
  duration: number;
  elapsed: number;
  easing: EasingFunction;
  isComplete: boolean;
  currentValue: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Create a new tween
 */
export const createTween = (
  startValue: number,
  endValue: number,
  duration: number,
  easing: EasingFunction = easeOutCubic,
  callbacks?: {
    onUpdate?: (value: number) => void;
    onComplete?: () => void;
  }
): Tween => ({
  startValue,
  endValue,
  duration,
  elapsed: 0,
  easing,
  isComplete: false,
  currentValue: startValue,
  onUpdate: callbacks?.onUpdate,
  onComplete: callbacks?.onComplete,
});

/**
 * Update tween and return current value
 */
export const updateTween = (tween: Tween, deltaTime: number): number => {
  if (tween.isComplete) return tween.endValue;

  tween.elapsed += deltaTime;
  const progress = Math.min(tween.elapsed / tween.duration, 1);
  const easedProgress = tween.easing(progress);

  tween.currentValue =
    tween.startValue + (tween.endValue - tween.startValue) * easedProgress;

  if (tween.onUpdate) {
    tween.onUpdate(tween.currentValue);
  }

  if (progress >= 1) {
    tween.isComplete = true;
    tween.currentValue = tween.endValue;
    if (tween.onComplete) {
      tween.onComplete();
    }
  }

  return tween.currentValue;
};

/**
 * Reset a tween to replay it
 */
export const resetTween = (tween: Tween): void => {
  tween.elapsed = 0;
  tween.isComplete = false;
  tween.currentValue = tween.startValue;
};

// ============================================
// ANIMATION UTILITIES
// ============================================

/**
 * Linear interpolation
 */
export const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t;

/**
 * Inverse lerp - find t given value
 */
export const inverseLerp = (start: number, end: number, value: number): number =>
  (value - start) / (end - start);

/**
 * Remap value from one range to another
 */
export const remap = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
};

/**
 * Smoothstep - smooth interpolation between 0 and 1
 */
export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Spring physics simulation
 */
export interface Spring {
  value: number;
  target: number;
  velocity: number;
  stiffness: number;
  damping: number;
}

export const createSpring = (
  initialValue: number,
  options?: {
    stiffness?: number;
    damping?: number;
  }
): Spring => ({
  value: initialValue,
  target: initialValue,
  velocity: 0,
  stiffness: options?.stiffness ?? 100,
  damping: options?.damping ?? 10,
});

export const updateSpring = (spring: Spring, deltaTime: number): number => {
  const dt = deltaTime / 1000; // Convert to seconds

  const force = (spring.target - spring.value) * spring.stiffness;
  const dampingForce = spring.velocity * spring.damping;

  spring.velocity += (force - dampingForce) * dt;
  spring.value += spring.velocity * dt;

  return spring.value;
};

export const setSpringTarget = (spring: Spring, target: number): void => {
  spring.target = target;
};

// ============================================
// TIMING UTILITIES
// ============================================

/**
 * Create a timer that fires callback after duration
 */
export interface Timer {
  duration: number;
  elapsed: number;
  isComplete: boolean;
  callback: () => void;
  loop: boolean;
}

export const createTimer = (
  duration: number,
  callback: () => void,
  loop: boolean = false
): Timer => ({
  duration,
  elapsed: 0,
  isComplete: false,
  callback,
  loop,
});

export const updateTimer = (timer: Timer, deltaTime: number): boolean => {
  if (timer.isComplete && !timer.loop) return false;

  timer.elapsed += deltaTime;

  if (timer.elapsed >= timer.duration) {
    timer.callback();

    if (timer.loop) {
      timer.elapsed = timer.elapsed % timer.duration;
    } else {
      timer.isComplete = true;
    }

    return true; // Timer fired
  }

  return false;
};

export const resetTimer = (timer: Timer): void => {
  timer.elapsed = 0;
  timer.isComplete = false;
};

/**
 * Pulse value between min and max over time
 */
export const pulse = (
  time: number,
  frequency: number,
  min: number = 0,
  max: number = 1
): number => {
  const t = (Math.sin(time * frequency * Math.PI * 2) + 1) / 2;
  return lerp(min, max, t);
};

/**
 * Get oscillating value (useful for breathing, bobbing)
 */
export const oscillate = (
  time: number,
  frequency: number,
  amplitude: number = 1
): number => {
  return Math.sin(time * frequency * Math.PI * 2) * amplitude;
};
