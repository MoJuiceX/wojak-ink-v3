/**
 * useGameEffects Hook
 *
 * Universal visual effects system for all games.
 * Provides shockwaves, sparks, screen shake, confetti, and more.
 */

import { useState, useCallback } from 'react';

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

interface ScorePopup {
  id: string;
  score: number;
  x: number;
  y: number;
  color?: string;
  prefix?: string;
}

export interface GameEffectsState {
  showShockwave: boolean;
  shockwaveColor: string;
  shockwaveScale: number;
  showImpactSparks: boolean;
  sparksColor: string;
  showVignette: boolean;
  vignetteColor: string;
  screenShake: boolean;
  floatingEmojis: FloatingEmoji[];
  epicCallout: string | null;
  showConfetti: boolean;
  combo: number;
  scorePopups: ScorePopup[];
}

export function useGameEffects() {
  const [effects, setEffects] = useState<GameEffectsState>({
    showShockwave: false,
    shockwaveColor: '#ff6b00',
    shockwaveScale: 1,
    showImpactSparks: false,
    sparksColor: '#ff6b00',
    showVignette: false,
    vignetteColor: '#ff0000',
    screenShake: false,
    floatingEmojis: [],
    epicCallout: null,
    showConfetti: false,
    combo: 0,
    scorePopups: [],
  });

  // Trigger shockwave with optional color and scale
  const triggerShockwave = useCallback((color: string = '#ff6b00', scale: number = 1) => {
    setEffects((prev) => ({
      ...prev,
      showShockwave: true,
      shockwaveColor: color,
      shockwaveScale: scale,
    }));
    setTimeout(() => {
      setEffects((prev) => ({ ...prev, showShockwave: false }));
    }, 600);
  }, []);

  // Trigger impact sparks with optional color
  const triggerSparks = useCallback((color: string = '#ff6b00') => {
    setEffects((prev) => ({
      ...prev,
      showImpactSparks: true,
      sparksColor: color,
    }));
    setTimeout(() => {
      setEffects((prev) => ({ ...prev, showImpactSparks: false }));
    }, 500);
  }, []);

  // Trigger vignette flash with optional color
  const triggerVignette = useCallback((color: string = '#ff0000') => {
    setEffects((prev) => ({ ...prev, showVignette: true, vignetteColor: color }));
    setTimeout(() => {
      setEffects((prev) => ({ ...prev, showVignette: false }));
    }, 400);
  }, []);

  // Trigger screen shake with optional duration
  const triggerScreenShake = useCallback((duration: number = 300) => {
    setEffects((prev) => ({ ...prev, screenShake: true }));
    setTimeout(() => {
      setEffects((prev) => ({ ...prev, screenShake: false }));
    }, duration);
  }, []);

  // Add floating emoji (rises up and fades)
  const addFloatingEmoji = useCallback((emoji?: string) => {
    const emojis = ['🔥', '⚡', '💎', '🌟', '✨', '💥', '🚀', '👑', '🎯', '💪'];
    const selectedEmoji = emoji || emojis[Math.floor(Math.random() * emojis.length)];
    const id = `emoji-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const x = 30 + Math.random() * 40; // Random x between 30-70%

    setEffects((prev) => ({
      ...prev,
      floatingEmojis: [...prev.floatingEmojis, { id, emoji: selectedEmoji, x }],
    }));

    setTimeout(() => {
      setEffects((prev) => ({
        ...prev,
        floatingEmojis: prev.floatingEmojis.filter((e) => e.id !== id),
      }));
    }, 1500);
  }, []);

  // Show epic callout text ("PERFECT!", "UNSTOPPABLE!", etc.)
  const showEpicCallout = useCallback((text: string) => {
    setEffects((prev) => ({ ...prev, epicCallout: text }));
    setTimeout(() => {
      setEffects((prev) => ({ ...prev, epicCallout: null }));
    }, 1500);
  }, []);

  // Trigger confetti celebration
  const triggerConfetti = useCallback(() => {
    setEffects((prev) => ({ ...prev, showConfetti: true }));
    setTimeout(() => {
      setEffects((prev) => ({ ...prev, showConfetti: false }));
    }, 3000);
  }, []);

  // Update combo count (auto-increment)
  const updateCombo = useCallback(() => {
    setEffects((prev) => {
      const newCombo = prev.combo + 1;
      return { ...prev, combo: newCombo };
    });
  }, []);

  // Reset combo to 0
  const resetCombo = useCallback(() => {
    setEffects((prev) => ({ ...prev, combo: 0 }));
  }, []);

  // Add flying score popup (takes string like "+10" or "+100 BONUS!")
  const addScorePopup = useCallback(
    (text: string, x = 50, y = 40, color?: string) => {
      const id = `score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Parse score from text (e.g., "+10" -> 10, "+100 BONUS!" -> 100)
      const scoreMatch = text.match(/[+-]?(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const prefix = text.startsWith('+') ? '+' : text.startsWith('-') ? '-' : '';
      setEffects((prev) => ({
        ...prev,
        scorePopups: [...prev.scorePopups, { id, score, x, y, color, prefix }],
      }));
      setTimeout(() => {
        setEffects((prev) => ({
          ...prev,
          scorePopups: prev.scorePopups.filter((p) => p.id !== id),
        }));
      }, 1200);
    },
    []
  );

  // Combined "big moment" effect - triggers multiple effects at once
  const triggerBigMoment = useCallback(
    (options?: {
      shockwave?: boolean;
      shockwaveColor?: string;
      sparks?: boolean;
      sparksColor?: string;
      shake?: boolean;
      shakeDuration?: number;
      vignette?: boolean;
      vignetteColor?: string;
      emoji?: string;
      callout?: string;
      confetti?: boolean;
      score?: string;
      scoreColor?: string;
    }) => {
      if (options?.shockwave !== false) triggerShockwave(options?.shockwaveColor, 1);
      if (options?.sparks) triggerSparks(options?.sparksColor);
      if (options?.shake) triggerScreenShake(options?.shakeDuration);
      if (options?.vignette) triggerVignette(options?.vignetteColor);
      if (options?.emoji) addFloatingEmoji(options.emoji);
      if (options?.callout) showEpicCallout(options.callout);
      if (options?.confetti) triggerConfetti();
      if (options?.score) addScorePopup(options.score, 50, 40, options.scoreColor);
    },
    [
      triggerShockwave,
      triggerSparks,
      triggerScreenShake,
      triggerVignette,
      addFloatingEmoji,
      showEpicCallout,
      triggerConfetti,
      addScorePopup,
    ]
  );

  // Reset all effects (useful when game restarts)
  const resetAllEffects = useCallback(() => {
    setEffects({
      showShockwave: false,
      shockwaveColor: '#ff6b00',
      shockwaveScale: 1,
      showImpactSparks: false,
      sparksColor: '#ff6b00',
      showVignette: false,
      vignetteColor: '#ff0000',
      screenShake: false,
      floatingEmojis: [],
      epicCallout: null,
      showConfetti: false,
      combo: 0,
      scorePopups: [],
    });
  }, []);

  return {
    effects,
    triggerShockwave,
    triggerSparks,
    triggerVignette,
    triggerScreenShake,
    addFloatingEmoji,
    showEpicCallout,
    triggerConfetti,
    updateCombo,
    resetCombo,
    addScorePopup,
    triggerBigMoment,
    resetAllEffects,
  };
}
