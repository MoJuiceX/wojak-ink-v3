/**
 * useKeyboardVisible
 *
 * Detects when the virtual keyboard is open on mobile devices.
 * Uses the Visual Viewport API to detect viewport size changes.
 */

import { useState, useEffect } from 'react';

export const useKeyboardVisible = (): boolean => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // Visual viewport is smaller than layout viewport when keyboard is open
      // We use a 75% threshold to detect keyboard (keyboard typically takes 40-50% of screen)
      if (window.visualViewport) {
        const isVisible = window.visualViewport.height < window.innerHeight * 0.75;
        setKeyboardVisible(isVisible);
      }
    };

    // Listen to visual viewport resize events
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  return isKeyboardVisible;
};

export default useKeyboardVisible;
