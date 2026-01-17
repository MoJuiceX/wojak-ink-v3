/**
 * Game Sounds Hook
 *
 * Provides game-specific sound triggers.
 * Use this in games instead of SoundManager directly.
 */

import { useCallback, useEffect, useRef } from 'react';
import { SoundManager } from './SoundManager';
import { type SoundName, getComboSound } from './sounds';

/**
 * Hook for game-specific sound triggers
 */
export const useGameSounds = () => {
  const isInitializedRef = useRef(false);

  // Initialize sound manager on first user interaction
  useEffect(() => {
    if (isInitializedRef.current) return;

    const handleInteraction = () => {
      if (!SoundManager.getIsInitialized()) {
        SoundManager.initialize();
      }
      isInitializedRef.current = true;
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Play any sound by name
  const play = useCallback((name: SoundName, volume?: number) => {
    SoundManager.play(name, volume);
  }, []);

  // Score earned
  const playScore = useCallback(() => {
    SoundManager.play('score');
  }, []);

  // Combo achieved - escalating sounds based on level
  const playCombo = useCallback((level: number) => {
    const soundName = getComboSound(level);
    SoundManager.play(soundName);
  }, []);

  // New high score
  const playHighScore = useCallback(() => {
    SoundManager.play('high-score');
  }, []);

  // Game over
  const playGameOver = useCallback(() => {
    SoundManager.play('game-over');
  }, []);

  // Game start
  const playGameStart = useCallback(() => {
    SoundManager.play('game-start');
  }, []);

  // Countdown (3, 2, 1)
  const playCountdown = useCallback(() => {
    SoundManager.play('countdown');
  }, []);

  // Countdown GO!
  const playCountdownGo = useCallback(() => {
    SoundManager.play('countdown-go');
  }, []);

  // Achievement unlocked
  const playAchievement = useCallback(() => {
    SoundManager.play('achievement');
  }, []);

  // Currency earned (oranges/gems)
  const playCurrencyEarn = useCallback(() => {
    SoundManager.play('currency-earn');
  }, []);

  // Level up
  const playLevelUp = useCallback(() => {
    SoundManager.play('level-up');
  }, []);

  // Warning (low time, etc.)
  const playWarning = useCallback(() => {
    SoundManager.play('warning');
  }, []);

  // Button click (for UI)
  const playButtonClick = useCallback(() => {
    SoundManager.play('button-click');
  }, []);

  // Generic success
  const playSuccess = useCallback(() => {
    SoundManager.play('success');
  }, []);

  // Generic error
  const playError = useCallback(() => {
    SoundManager.play('error');
  }, []);

  // Stop all sounds
  const stopAll = useCallback(() => {
    SoundManager.stopAll();
  }, []);

  // Get mute state
  const isMuted = useCallback(() => {
    return SoundManager.getMuted();
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    return SoundManager.toggleMute();
  }, []);

  return {
    // Individual game sounds
    playScore,
    playCombo,
    playHighScore,
    playGameOver,
    playGameStart,
    playCountdown,
    playCountdownGo,
    playAchievement,
    playCurrencyEarn,
    playLevelUp,
    playWarning,
    playButtonClick,
    playSuccess,
    playError,
    // Utilities
    play,
    stopAll,
    isMuted,
    toggleMute
  };
};

export default useGameSounds;
