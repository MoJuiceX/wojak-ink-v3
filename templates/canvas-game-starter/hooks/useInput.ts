/**
 * useInput Hook
 * Unified input handling for keyboard, mouse, and touch
 *
 * @example
 * const { isPressed, justPressed, getPointer, getTouchCount } = useInput(canvasRef);
 *
 * // Check input in game loop
 * if (justPressed('action') || justPressed('touch')) {
 *   player.jump();
 * }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { isTouchDevice } from '@/lib/utils';
import { MOBILE } from '../config';

// ============================================
// TYPES
// ============================================

export interface Point {
  x: number;
  y: number;
}

export interface Pointer extends Point {
  isDown: boolean;
  justPressed: boolean;
  justReleased: boolean;
}

export interface TouchInfo {
  id: number;
  position: Point;
  startPosition: Point;
  startTime: number;
}

export type InputAction =
  | 'action' // Primary action (space, click, tap)
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'pause'
  | 'touch'; // Any touch/click

export interface UseInputReturn {
  isPressed: (action: InputAction) => boolean;
  justPressed: (action: InputAction) => boolean;
  justReleased: (action: InputAction) => boolean;
  getPointer: () => Pointer;
  getTouchCount: () => number;
  getTouches: () => TouchInfo[];
  clearJustPressed: () => void;
  isTouchDevice: boolean;
}

// ============================================
// KEY MAPPINGS
// ============================================

const KEY_MAPPINGS: Record<string, InputAction[]> = {
  ' ': ['action'],
  Space: ['action'],
  Enter: ['action'],
  ArrowUp: ['up', 'action'],
  ArrowDown: ['down'],
  ArrowLeft: ['left'],
  ArrowRight: ['right'],
  KeyW: ['up'],
  KeyS: ['down'],
  KeyA: ['left'],
  KeyD: ['right'],
  Escape: ['pause'],
  KeyP: ['pause'],
};

// ============================================
// HOOK
// ============================================

export const useInput = (canvasRef: React.RefObject<HTMLCanvasElement>): UseInputReturn => {
  // Current state
  const pressedRef = useRef<Set<InputAction>>(new Set());
  const justPressedRef = useRef<Set<InputAction>>(new Set());
  const justReleasedRef = useRef<Set<InputAction>>(new Set());

  // Pointer state
  const pointerRef = useRef<Pointer>({
    x: 0,
    y: 0,
    isDown: false,
    justPressed: false,
    justReleased: false,
  });

  // Touch tracking
  const touchesRef = useRef<Map<number, TouchInfo>>(new Map());

  // Touch device detection
  const [touchDevice] = useState(() => isTouchDevice());

  // Get canvas-relative coordinates
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: clientX, y: clientY };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  // Press an action
  const pressAction = useCallback((action: InputAction) => {
    if (!pressedRef.current.has(action)) {
      justPressedRef.current.add(action);
    }
    pressedRef.current.add(action);
  }, []);

  // Release an action
  const releaseAction = useCallback((action: InputAction) => {
    if (pressedRef.current.has(action)) {
      justReleasedRef.current.add(action);
    }
    pressedRef.current.delete(action);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const actions = KEY_MAPPINGS[e.code] || KEY_MAPPINGS[e.key];
      if (actions) {
        e.preventDefault();
        actions.forEach(pressAction);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const actions = KEY_MAPPINGS[e.code] || KEY_MAPPINGS[e.key];
      if (actions) {
        actions.forEach(releaseAction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressAction, releaseAction]);

  // Mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      pointerRef.current = {
        ...coords,
        isDown: true,
        justPressed: true,
        justReleased: false,
      };
      pressAction('touch');
      pressAction('action');
    };

    const handleMouseUp = () => {
      pointerRef.current.isDown = false;
      pointerRef.current.justReleased = true;
      releaseAction('touch');
      releaseAction('action');
    };

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      pointerRef.current.x = coords.x;
      pointerRef.current.y = coords.y;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef, getCanvasCoords, pressAction, releaseAction]);

  // Touch handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();

      for (const touch of Array.from(e.changedTouches)) {
        const coords = getCanvasCoords(touch.clientX, touch.clientY);

        touchesRef.current.set(touch.identifier, {
          id: touch.identifier,
          position: coords,
          startPosition: coords,
          startTime: Date.now(),
        });
      }

      // Update pointer to first touch
      const firstTouch = e.touches[0];
      if (firstTouch) {
        const coords = getCanvasCoords(firstTouch.clientX, firstTouch.clientY);
        pointerRef.current = {
          ...coords,
          isDown: true,
          justPressed: true,
          justReleased: false,
        };
      }

      pressAction('touch');
      pressAction('action');
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      for (const touch of Array.from(e.changedTouches)) {
        const info = touchesRef.current.get(touch.identifier);
        if (info) {
          info.position = getCanvasCoords(touch.clientX, touch.clientY);
        }
      }

      // Update pointer to first touch
      const firstTouch = e.touches[0];
      if (firstTouch) {
        const coords = getCanvasCoords(firstTouch.clientX, firstTouch.clientY);
        pointerRef.current.x = coords.x;
        pointerRef.current.y = coords.y;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();

      for (const touch of Array.from(e.changedTouches)) {
        const info = touchesRef.current.get(touch.identifier);
        if (info) {
          // Check for tap gesture
          const duration = Date.now() - info.startTime;
          const distance = Math.hypot(
            info.position.x - info.startPosition.x,
            info.position.y - info.startPosition.y
          );

          if (duration < MOBILE.gestures.tapMaxDuration && distance < 20) {
            // It's a tap!
          }

          touchesRef.current.delete(touch.identifier);
        }
      }

      // Release if no more touches
      if (e.touches.length === 0) {
        pointerRef.current.isDown = false;
        pointerRef.current.justReleased = true;
        releaseAction('touch');
        releaseAction('action');
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [canvasRef, getCanvasCoords, pressAction, releaseAction]);

  // API
  const isPressed = useCallback((action: InputAction): boolean => {
    return pressedRef.current.has(action);
  }, []);

  const justPressed = useCallback((action: InputAction): boolean => {
    return justPressedRef.current.has(action);
  }, []);

  const justReleased = useCallback((action: InputAction): boolean => {
    return justReleasedRef.current.has(action);
  }, []);

  const getPointer = useCallback((): Pointer => {
    return { ...pointerRef.current };
  }, []);

  const getTouchCount = useCallback((): number => {
    return touchesRef.current.size;
  }, []);

  const getTouches = useCallback((): TouchInfo[] => {
    return Array.from(touchesRef.current.values());
  }, []);

  // Clear just pressed/released flags (call at end of frame)
  const clearJustPressed = useCallback(() => {
    justPressedRef.current.clear();
    justReleasedRef.current.clear();
    pointerRef.current.justPressed = false;
    pointerRef.current.justReleased = false;
  }, []);

  return {
    isPressed,
    justPressed,
    justReleased,
    getPointer,
    getTouchCount,
    getTouches,
    clearJustPressed,
    isTouchDevice: touchDevice,
  };
};

export default useInput;
