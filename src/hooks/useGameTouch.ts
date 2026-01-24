/**
 * useGameTouch Hook
 *
 * Shared touch handling for games with tap, swipe, and drag support.
 * Provides immediate response using touchstart and prevents accidental scrolling.
 */

import { useCallback, useRef } from 'react';

interface TouchConfig {
  onTap?: (x: number, y: number) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number, dx: number, dy: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  swipeThreshold?: number;
  preventScroll?: boolean;
}

export function useGameTouch(config: TouchConfig) {
  const {
    onTap,
    onSwipe,
    onDragStart,
    onDrag,
    onDragEnd,
    swipeThreshold = Math.max(30, window.innerWidth * 0.08),
    preventScroll = true,
  } = config;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventScroll) e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    if (onDragStart) {
      isDraggingRef.current = true;
      onDragStart(touch.clientX, touch.clientY);
    }
  }, [onDragStart, preventScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventScroll) e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    if (isDraggingRef.current && onDrag) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      onDrag(touch.clientX, touch.clientY, dx, dy);
    }
  }, [onDrag, preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (preventScroll) e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Detect swipe vs tap
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (isDraggingRef.current && onDragEnd) {
      onDragEnd(touch.clientX, touch.clientY);
      isDraggingRef.current = false;
    } else if (absX > swipeThreshold || absY > swipeThreshold) {
      // Swipe detected
      if (onSwipe) {
        if (absX > absY) {
          onSwipe(dx > 0 ? 'right' : 'left');
        } else {
          onSwipe(dy > 0 ? 'down' : 'up');
        }
      }
    } else if (duration < 300 && onTap) {
      // Quick tap
      onTap(touch.clientX, touch.clientY);
    }

    touchStartRef.current = null;
  }, [onTap, onSwipe, onDragEnd, swipeThreshold, preventScroll]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

export default useGameTouch;
