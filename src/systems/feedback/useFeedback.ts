/**
 * Combined Feedback Hook
 *
 * Triggers both sound and haptics together for synchronized feedback.
 *
 * Usage:
 *   import { useFeedback } from '@/systems/feedback';
 *
 *   const { feedbackScore, feedbackCombo, feedbackGameOver } = useFeedback();
 *   feedbackScore(); // Plays sound + haptic
 */

import { useCallback } from 'react';
import { useGameSounds } from '../audio/useGameSounds';
import { useGameHaptics } from '../haptics/useGameHaptics';

/**
 * Combined feedback hook - triggers both sound and haptics
 * Use this for synchronized audio-haptic feedback
 */
export const useFeedback = () => {
  const sounds = useGameSounds();
  const haptics = useGameHaptics();

  // Score feedback (sound + haptic)
  const feedbackScore = useCallback(() => {
    sounds.playScore();
    haptics.hapticScore();
  }, [sounds, haptics]);

  // Combo feedback
  const feedbackCombo = useCallback((level: number) => {
    sounds.playCombo(level);
    haptics.hapticCombo(level);
  }, [sounds, haptics]);

  // High score feedback
  const feedbackHighScore = useCallback(() => {
    sounds.playHighScore();
    haptics.hapticHighScore();
  }, [sounds, haptics]);

  // Game over feedback
  const feedbackGameOver = useCallback(() => {
    sounds.playGameOver();
    haptics.hapticGameOver();
  }, [sounds, haptics]);

  // Game start feedback
  const feedbackGameStart = useCallback(() => {
    sounds.playGameStart();
    haptics.hapticButton();
  }, [sounds, haptics]);

  // Level up feedback
  const feedbackLevelUp = useCallback(() => {
    sounds.playLevelUp();
    haptics.hapticLevelUp();
  }, [sounds, haptics]);

  // Button press feedback
  const feedbackButton = useCallback(() => {
    sounds.playButtonClick();
    haptics.hapticButton();
  }, [sounds, haptics]);

  // Achievement feedback
  const feedbackAchievement = useCallback(() => {
    sounds.playAchievement();
    haptics.hapticAchievement();
  }, [sounds, haptics]);

  // Success feedback
  const feedbackSuccess = useCallback(() => {
    sounds.playSuccess();
    haptics.hapticSuccess();
  }, [sounds, haptics]);

  // Error feedback
  const feedbackError = useCallback(() => {
    sounds.playError();
    haptics.hapticError();
  }, [sounds, haptics]);

  // Warning feedback
  const feedbackWarning = useCallback(() => {
    sounds.playWarning();
    haptics.hapticWarning();
  }, [sounds, haptics]);

  // Countdown tick
  const feedbackCountdown = useCallback(() => {
    sounds.playCountdown();
    haptics.hapticCountdown();
  }, [sounds, haptics]);

  // Countdown GO!
  const feedbackCountdownGo = useCallback(() => {
    sounds.playCountdownGo();
    haptics.hapticCountdownGo();
  }, [sounds, haptics]);

  // Collision feedback
  const feedbackCollision = useCallback(() => {
    haptics.hapticCollision();
    // No specific collision sound, use error as impact
    sounds.playError();
  }, [sounds, haptics]);

  return {
    // Combined feedback
    feedbackScore,
    feedbackCombo,
    feedbackHighScore,
    feedbackGameOver,
    feedbackGameStart,
    feedbackLevelUp,
    feedbackButton,
    feedbackAchievement,
    feedbackSuccess,
    feedbackError,
    feedbackWarning,
    feedbackCountdown,
    feedbackCountdownGo,
    feedbackCollision,

    // Also expose individual systems for fine-grained control
    sounds,
    haptics
  };
};

export default useFeedback;
