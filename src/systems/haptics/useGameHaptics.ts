import { useCallback } from 'react';
import { useHaptics } from './HapticContext';

/**
 * Hook for game-specific haptic triggers
 * Use this in games instead of useHaptics directly
 */
export const useGameHaptics = () => {
  const { trigger, triggerCombo, isSupported, isEnabled } = useHaptics();

  // Score earned
  const hapticScore = useCallback(() => {
    trigger('score');
  }, [trigger]);

  // Combo achieved
  const hapticCombo = useCallback((level: number) => {
    triggerCombo(level);
  }, [triggerCombo]);

  // New high score
  const hapticHighScore = useCallback(() => {
    trigger('high-score');
  }, [trigger]);

  // Game over
  const hapticGameOver = useCallback(() => {
    trigger('game-over');
  }, [trigger]);

  // Collision/hit
  const hapticCollision = useCallback(() => {
    trigger('collision');
  }, [trigger]);

  // Level up
  const hapticLevelUp = useCallback(() => {
    trigger('level-up');
  }, [trigger]);

  // Achievement
  const hapticAchievement = useCallback(() => {
    trigger('achievement');
  }, [trigger]);

  // Countdown tick
  const hapticCountdown = useCallback(() => {
    trigger('countdown');
  }, [trigger]);

  // Countdown GO!
  const hapticCountdownGo = useCallback(() => {
    trigger('countdown-go');
  }, [trigger]);

  // Button press
  const hapticButton = useCallback(() => {
    trigger('button');
  }, [trigger]);

  // Success feedback
  const hapticSuccess = useCallback(() => {
    trigger('success');
  }, [trigger]);

  // Error feedback
  const hapticError = useCallback(() => {
    trigger('error');
  }, [trigger]);

  // Warning
  const hapticWarning = useCallback(() => {
    trigger('warning');
  }, [trigger]);

  return {
    // Game events
    hapticScore,
    hapticCombo,
    hapticHighScore,
    hapticGameOver,
    hapticCollision,
    hapticLevelUp,
    hapticAchievement,
    hapticCountdown,
    hapticCountdownGo,

    // UI events
    hapticButton,
    hapticSuccess,
    hapticError,
    hapticWarning,

    // State
    isSupported,
    isEnabled,

    // Raw trigger for custom patterns
    trigger
  };
};
