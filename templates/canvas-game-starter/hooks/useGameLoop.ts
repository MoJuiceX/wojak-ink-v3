/**
 * useGameLoop Hook
 * Manages the game loop with consistent timing and delta time
 */

import { useRef, useEffect, useCallback } from 'react';

interface GameLoopOptions {
  targetFPS?: number;
  onUpdate: (deltaTime: number, frameCount: number) => void;
  onRender: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;
  isPaused?: boolean;
}

interface GameLoopState {
  frameCount: number;
  lastTime: number;
  accumulator: number;
  fps: number;
  fpsUpdateTime: number;
  fpsFrameCount: number;
}

export const useGameLoop = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: GameLoopOptions
) => {
  const { targetFPS = 60, onUpdate, onRender, isPaused = false } = options;

  const frameTime = 1000 / targetFPS;
  const rafIdRef = useRef<number>(0);
  const stateRef = useRef<GameLoopState>({
    frameCount: 0,
    lastTime: 0,
    accumulator: 0,
    fps: 0,
    fpsUpdateTime: 0,
    fpsFrameCount: 0,
  });

  const loop = useCallback(
    (currentTime: number) => {
      const state = stateRef.current;

      // Initialize on first frame
      if (state.lastTime === 0) {
        state.lastTime = currentTime;
        state.fpsUpdateTime = currentTime;
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // Calculate delta time
      const deltaTime = currentTime - state.lastTime;
      state.lastTime = currentTime;

      // FPS calculation
      state.fpsFrameCount++;
      if (currentTime - state.fpsUpdateTime >= 1000) {
        state.fps = state.fpsFrameCount;
        state.fpsFrameCount = 0;
        state.fpsUpdateTime = currentTime;
      }

      // Skip if paused
      if (!isPaused) {
        // Fixed timestep for physics
        state.accumulator += deltaTime;
        while (state.accumulator >= frameTime) {
          onUpdate(frameTime, state.frameCount);
          state.accumulator -= frameTime;
          state.frameCount++;
        }

        // Render
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            onRender(ctx, deltaTime);
          }
        }
      }

      // Continue loop
      rafIdRef.current = requestAnimationFrame(loop);
    },
    [canvasRef, frameTime, isPaused, onUpdate, onRender]
  );

  // Start/stop loop
  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [loop]);

  // Return useful values
  return {
    frameCount: stateRef.current.frameCount,
    fps: stateRef.current.fps,
    reset: () => {
      stateRef.current = {
        frameCount: 0,
        lastTime: 0,
        accumulator: 0,
        fps: 0,
        fpsUpdateTime: 0,
        fpsFrameCount: 0,
      };
    },
  };
};

/**
 * Simple RAF hook for when you just need animation frames
 */
export const useAnimationFrame = (callback: (deltaTime: number) => void) => {
  const rafIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== 0) {
        const deltaTime = time - lastTimeRef.current;
        callback(deltaTime);
      }
      lastTimeRef.current = time;
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [callback]);
};

/**
 * Pause-aware timeout
 */
export const useGameTimeout = (
  callback: () => void,
  delay: number,
  isPaused: boolean
) => {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const remainingRef = useRef(delay);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (isPaused) {
      // Pause: save remaining time
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        remainingRef.current -= Date.now() - startTimeRef.current;
      }
    } else {
      // Resume: restart with remaining time
      startTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        savedCallback.current();
      }, remainingRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPaused]);
};
