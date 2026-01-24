/**
 * useGameNavigationGuard Hook
 *
 * Protects active games from accidental navigation.
 * Shows a confirmation dialog when the user tries to leave during gameplay.
 *
 * Features:
 * - Intercepts browser back/forward navigation via popstate
 * - 3-second grace period for intentional quick exits
 * - Returns state for rendering a ConfirmModal
 *
 * Note: This approach works with BrowserRouter (doesn't require data router).
 * It intercepts the browser's popstate event and manages history manually.
 *
 * Usage:
 *   const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
 *     isPlaying: gameState === 'playing',
 *   });
 *
 *   // Pause game when dialog is shown
 *   // Render ConfirmModal with showExitDialog, confirmExit, cancelExit
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseGameNavigationGuardOptions {
  /** Whether the game is currently being played */
  isPlaying: boolean;
  /** Grace period in ms before blocking starts (default: 3000) */
  gracePeriod?: number;
  /** Custom callback when user confirms exit (optional - defaults to history.go(-2)) */
  onConfirmExit?: () => void;
}

interface UseGameNavigationGuardReturn {
  /** Whether to show the exit confirmation dialog */
  showExitDialog: boolean;
  /** Call this when user confirms they want to leave */
  confirmExit: () => void;
  /** Call this when user wants to stay in the game */
  cancelExit: () => void;
}

export function useGameNavigationGuard({
  isPlaying,
  gracePeriod = 3000,
  onConfirmExit,
}: UseGameNavigationGuardOptions): UseGameNavigationGuardReturn {
  // Note: useNavigate/useLocation available if needed for future features
  // Currently using window.history API directly for navigation control

  // Track when gameplay started
  const playStartTimeRef = useRef<number | null>(null);

  // Track if we should show the dialog
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Store the intended navigation path
  const pendingNavigationRef = useRef<string | null>(null);

  // Track if we pushed a guard state
  const guardActiveRef = useRef(false);

  // Update play start time when game starts/stops
  useEffect(() => {
    if (isPlaying && playStartTimeRef.current === null) {
      // Game just started
      playStartTimeRef.current = Date.now();
    } else if (!isPlaying) {
      // Game stopped, reset timer
      playStartTimeRef.current = null;
    }
  }, [isPlaying]);

  // Check if we should block navigation
  const shouldBlock = useCallback(() => {
    if (!isPlaying) return false;

    // Check grace period
    if (playStartTimeRef.current === null) return false;
    const playDuration = Date.now() - playStartTimeRef.current;

    // Allow free navigation during grace period
    if (playDuration < gracePeriod) return false;

    return true;
  }, [isPlaying, gracePeriod]);

  // Push a guard state when game starts (after grace period)
  useEffect(() => {
    if (!isPlaying) {
      guardActiveRef.current = false;
      return;
    }

    // Wait for grace period, then push guard state
    const timer = setTimeout(() => {
      if (isPlaying && !guardActiveRef.current) {
        // Push a duplicate history entry as our "guard"
        window.history.pushState({ guard: true }, '', window.location.href);
        guardActiveRef.current = true;
      }
    }, gracePeriod);

    return () => clearTimeout(timer);
  }, [isPlaying, gracePeriod]);

  // Handle popstate (back/forward button)
  useEffect(() => {
    const handlePopState = (_event: PopStateEvent) => {
      // If we're playing and past grace period, intercept
      if (shouldBlock()) {
        // Push state back to prevent navigation
        window.history.pushState({ guard: true }, '', window.location.href);

        // Store that user tried to go back
        pendingNavigationRef.current = 'back';

        // Show confirmation dialog
        setShowExitDialog(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [shouldBlock]);

  // Confirm exit - proceed with navigation
  const confirmExit = useCallback(() => {
    setShowExitDialog(false);
    guardActiveRef.current = false;

    // Go back in history (the user wanted to leave)
    if (pendingNavigationRef.current === 'back') {
      // Use custom callback if provided, otherwise navigate to /games
      if (onConfirmExit) {
        onConfirmExit();
      } else {
        // Navigate to games page - works better in modal context than history.go(-2)
        window.location.href = '/games';
      }
    }

    pendingNavigationRef.current = null;
  }, [onConfirmExit]);

  // Cancel exit - stay in game
  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
    pendingNavigationRef.current = null;
  }, []);

  // Cleanup guard state when unmounting or game ends
  useEffect(() => {
    return () => {
      // Don't manipulate history on unmount - it can cause issues
      guardActiveRef.current = false;
    };
  }, []);

  return {
    showExitDialog,
    confirmExit,
    cancelExit,
  };
}

export default useGameNavigationGuard;
