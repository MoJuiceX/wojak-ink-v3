/**
 * useGameViewport Hook
 *
 * Provides viewport information for responsive game UI.
 * Handles resize and orientation changes.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;        // width <= 768
  isSmallMobile: boolean;   // width <= 480
  isTinyMobile: boolean;    // width <= 380
  isLandscape: boolean;
  safeAreaBottom: number;
  safeAreaTop: number;
}

function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Get safe area insets for devices with notches
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaBottom = parseInt(
    computedStyle.getPropertyValue('--sab') ||
    computedStyle.getPropertyValue('env(safe-area-inset-bottom)') ||
    '0'
  ) || 60; // Default to 60px for bottom nav

  const safeAreaTop = parseInt(
    computedStyle.getPropertyValue('--sat') ||
    computedStyle.getPropertyValue('env(safe-area-inset-top)') ||
    '0'
  ) || 0;

  return {
    width,
    height,
    isMobile: width <= 768,
    isSmallMobile: width <= 480,
    isTinyMobile: width <= 380,
    isLandscape: width > height,
    safeAreaBottom,
    safeAreaTop,
  };
}

export function useGameViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => getViewportInfo());

  const handleResize = useCallback(() => {
    setViewport(getViewportInfo());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Also listen for visual viewport changes (iOS keyboard, etc.)
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
  }, [handleResize]);

  return viewport;
}

export default useGameViewport;
