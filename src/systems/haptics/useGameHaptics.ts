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

  // Card hover (ultra-light)
  const hapticHover = useCallback(() => {
    trigger('hover');
  }, [trigger]);

  // Success feedback
  const hapticSuccess = useCallback(() => {
    trigger('success');
  }, [trigger]);

  // Mismatch feedback (Memory Match specific)
  const hapticMismatch = useCallback(() => {
    trigger('mismatch');
  }, [trigger]);

  // Error feedback
  const hapticError = useCallback(() => {
    trigger('error');
  }, [trigger]);

  // Warning
  const hapticWarning = useCallback(() => {
    trigger('warning');
  }, [trigger]);

  // Urgency tick (final countdown)
  const hapticUrgencyTick = useCallback(() => {
    trigger('urgency-tick');
  }, [trigger]);

  // ========== BRICK BREAKER SPECIFIC HAPTICS ==========

  // Ball hits paddle
  const hapticBBPaddleHit = useCallback(() => {
    trigger('bb-paddle-hit');
  }, [trigger]);

  // Normal brick destroyed
  const hapticBBBrickNormal = useCallback(() => {
    trigger('bb-brick-normal');
  }, [trigger]);

  // Strong brick cracked (damaged but not destroyed)
  const hapticBBBrickCrack = useCallback(() => {
    trigger('bb-brick-crack');
  }, [trigger]);

  // Strong brick destroyed
  const hapticBBBrickStrong = useCallback(() => {
    trigger('bb-brick-strong');
  }, [trigger]);

  // Ball hits unbreakable brick
  const hapticBBUnbreakable = useCallback(() => {
    trigger('bb-unbreakable');
  }, [trigger]);

  // Powerup collected
  const hapticBBPowerupCollect = useCallback(() => {
    trigger('bb-powerup-collect');
  }, [trigger]);

  // Ball lost (fell off screen)
  const hapticBBBallLost = useCallback(() => {
    trigger('bb-ball-lost');
  }, [trigger]);

  // Near miss (ball barely missed paddle)
  const hapticBBNearMiss = useCallback(() => {
    trigger('bb-near-miss');
  }, [trigger]);

  // Level completed
  const hapticBBLevelComplete = useCallback(() => {
    trigger('bb-level-complete');
  }, [trigger]);

  // Combo was lost (timeout)
  const hapticBBComboBreak = useCallback(() => {
    trigger('bb-combo-break');
  }, [trigger]);

  // ========== ORANGE JUGGLE SPECIFIC HAPTICS ==========

  // Orange bounced off orangutan
  const hapticOJOrangeHit = useCallback(() => {
    trigger('oj-orange-hit');
  }, [trigger]);

  // Golden orange hit - celebratory
  const hapticOJGoldenHit = useCallback(() => {
    trigger('oj-golden-hit');
  }, [trigger]);

  // Orange dropped/missed
  const hapticOJOrangeDrop = useCallback(() => {
    trigger('oj-orange-drop');
  }, [trigger]);

  // Banana powerup collected
  const hapticOJBananaCollect = useCallback(() => {
    trigger('oj-banana-collect');
  }, [trigger]);

  // Rum powerup collected
  const hapticOJRumCollect = useCallback(() => {
    trigger('oj-rum-collect');
  }, [trigger]);

  // Camel warning - danger incoming
  const hapticOJCamelWarning = useCallback(() => {
    trigger('oj-camel-warning');
  }, [trigger]);

  // Camel impact - game over hit
  const hapticOJCamelImpact = useCallback(() => {
    trigger('oj-camel-impact');
  }, [trigger]);

  // Near miss - barely caught
  const hapticOJNearMiss = useCallback(() => {
    trigger('oj-near-miss');
  }, [trigger]);

  // Level completed
  const hapticOJLevelComplete = useCallback(() => {
    trigger('oj-level-complete');
  }, [trigger]);

  // ========== COLOR REACTION SPECIFIC HAPTICS ==========

  // Ultra-light tap confirmation
  const hapticCRTap = useCallback(() => {
    trigger('cr-tap');
  }, [trigger]);

  // PERFECT reaction (<300ms) - celebratory burst
  const hapticCRPerfect = useCallback(() => {
    trigger('cr-perfect');
  }, [trigger]);

  // GREAT reaction (<500ms) - strong success
  const hapticCRGreat = useCallback(() => {
    trigger('cr-great');
  }, [trigger]);

  // GOOD reaction (<700ms) - medium success
  const hapticCRGood = useCallback(() => {
    trigger('cr-good');
  }, [trigger]);

  // OK reaction (<1000ms) - light success
  const hapticCROk = useCallback(() => {
    trigger('cr-ok');
  }, [trigger]);

  // Wrong tap - gentle error
  const hapticCRWrong = useCallback(() => {
    trigger('cr-wrong');
  }, [trigger]);

  // Match window expired - single pulse
  const hapticCRMiss = useCallback(() => {
    trigger('cr-miss');
  }, [trigger]);

  // Ultra-light tick in final 500ms
  const hapticCRCountdownTick = useCallback(() => {
    trigger('cr-countdown-tick');
  }, [trigger]);

  // Double tap warning at 750ms
  const hapticCRCountdownWarning = useCallback(() => {
    trigger('cr-countdown-warning');
  }, [trigger]);

  // Rapid triple at 300ms - urgent!
  const hapticCRCountdownCritical = useCallback(() => {
    trigger('cr-countdown-critical');
  }, [trigger]);

  // Medium-heavy life loss pulse
  const hapticCRLoseLife = useCallback(() => {
    trigger('cr-lose-life');
  }, [trigger]);

  // Urgent last life warning
  const hapticCRLastLife = useCallback(() => {
    trigger('cr-last-life');
  }, [trigger]);

  // 5x streak milestone
  const hapticCRStreak5 = useCallback(() => {
    trigger('cr-streak-5');
  }, [trigger]);

  // 10x streak milestone
  const hapticCRStreak10 = useCallback(() => {
    trigger('cr-streak-10');
  }, [trigger]);

  // 15x streak milestone
  const hapticCRStreak15 = useCallback(() => {
    trigger('cr-streak-15');
  }, [trigger]);

  // 20x streak milestone - maximum!
  const hapticCRStreak20 = useCallback(() => {
    trigger('cr-streak-20');
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
    hapticHover,
    hapticSuccess,
    hapticMismatch,
    hapticError,
    hapticWarning,
    hapticUrgencyTick,

    // Brick Breaker specific
    hapticBBPaddleHit,
    hapticBBBrickNormal,
    hapticBBBrickCrack,
    hapticBBBrickStrong,
    hapticBBUnbreakable,
    hapticBBPowerupCollect,
    hapticBBBallLost,
    hapticBBNearMiss,
    hapticBBLevelComplete,
    hapticBBComboBreak,

    // Orange Juggle specific
    hapticOJOrangeHit,
    hapticOJGoldenHit,
    hapticOJOrangeDrop,
    hapticOJBananaCollect,
    hapticOJRumCollect,
    hapticOJCamelWarning,
    hapticOJCamelImpact,
    hapticOJNearMiss,
    hapticOJLevelComplete,

    // Color Reaction specific
    hapticCRTap,
    hapticCRPerfect,
    hapticCRGreat,
    hapticCRGood,
    hapticCROk,
    hapticCRWrong,
    hapticCRMiss,
    hapticCRCountdownTick,
    hapticCRCountdownWarning,
    hapticCRCountdownCritical,
    hapticCRLoseLife,
    hapticCRLastLife,
    hapticCRStreak5,
    hapticCRStreak10,
    hapticCRStreak15,
    hapticCRStreak20,

    // State
    isSupported,
    isEnabled,

    // Raw trigger for custom patterns
    trigger
  };
};
