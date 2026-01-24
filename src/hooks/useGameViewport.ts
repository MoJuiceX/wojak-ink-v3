/**
 * useGameViewport Hook
 *
 * Provides responsive viewport information for games including:
 * - Screen dimensions
 * - Mobile/desktop detection
 * - Orientation detection
 * - Safe area insets for notched devices
 */

import { useState, useEffect, useCallback } from 'react';

interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isLandscape: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

export function useGameViewport(): ViewportSize {
  const getSize = useCallback((): ViewportSize => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Get safe area insets from CSS custom properties
    const computedStyle = getComputedStyle(document.documentElement);
    const safeTop = parseInt(computedStyle.getPropertyValue('--sat') || '0', 10);
    const safeBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0', 10);
    const safeLeft = parseInt(computedStyle.getPropertyValue('--sal') || '0', 10);
    const safeRight = parseInt(computedStyle.getPropertyValue('--sar') || '0', 10);

    return {
      width,
      height,
      isMobile: width < 768,
      isLandscape: width > height,
      safeAreaTop: safeTop || 0,
      safeAreaBottom: safeBottom || 0,
      safeAreaLeft: safeLeft || 0,
      safeAreaRight: safeRight || 0,
    };
  }, []);

  const [size, setSize] = useState<ViewportSize>(getSize);

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Also listen for visual viewport changes (keyboard, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [getSize]);

  return size;
}

export default useGameViewport;
