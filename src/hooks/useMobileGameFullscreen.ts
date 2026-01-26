/**
 * useMobileGameFullscreen Hook
 * 
 * Handles mobile fullscreen mode for games:
 * - Adds 'game-fullscreen-mode' class to body (hides navigation)
 * - Locks body scroll to prevent accidental scrolling
 * - Cleans up on unmount or when deactivated
 * 
 * Usage:
 *   const isActiveGameState = gameState !== 'idle';
 *   useMobileGameFullscreen(isActiveGameState, isMobile);
 */

import { useEffect } from 'react';

export function useMobileGameFullscreen(isActive: boolean, isMobile: boolean): void {
  useEffect(() => {
    if (isMobile && isActive) {
      // Add fullscreen class to hide navigation
      document.body.classList.add('game-fullscreen-mode');
      
      // Lock body scroll to prevent accidental scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // Remove fullscreen class
      document.body.classList.remove('game-fullscreen-mode');
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('game-fullscreen-mode');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isMobile, isActive]);
}

export default useMobileGameFullscreen;
