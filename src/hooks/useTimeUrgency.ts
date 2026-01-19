/**
 * useTimeUrgency Hook
 *
 * Reusable time-based urgency system for games with timers.
 * Plays escalating warning sounds and returns urgency level for visual feedback.
 *
 * Usage:
 *   const { urgencyLevel } = useTimeUrgency({
 *     timeLeft: 15,
 *     totalTime: 40,
 *     isPlaying: gameState === 'playing',
 *     soundEnabled: true,
 *   });
 */

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

// Urgency levels for visual feedback
export type UrgencyLevel = 'normal' | 'warning' | 'urgent' | 'critical' | 'countdown';

interface UseTimeUrgencyOptions {
  timeLeft: number;
  totalTime: number;
  isPlaying: boolean;
  soundEnabled: boolean;
  // Optional custom thresholds (as percentages)
  warningThreshold?: number;  // Default: 0.5 (50%)
  urgentThreshold?: number;   // Default: 0.25 (25%)
  criticalSeconds?: number;   // Default: 10
  countdownSeconds?: number;  // Default: 5
}

interface UseTimeUrgencyReturn {
  urgencyLevel: UrgencyLevel;
  timePercent: number;
}

// Sound URLs
const WARNING_SOUND_URL = '/assets/sounds/warning.wav';
const COUNTDOWN_SOUND_URL = '/assets/sounds/countdown.wav';

// Pre-create Howl instances for different urgency sounds
let warningSound: Howl | null = null;
let countdownSound: Howl | null = null;
let tickSound: Howl | null = null;

function getWarningSound(): Howl {
  if (!warningSound) {
    warningSound = new Howl({
      src: [WARNING_SOUND_URL],
      volume: 0.4,
      preload: true,
    });
  }
  return warningSound;
}

function getCountdownSound(): Howl {
  if (!countdownSound) {
    countdownSound = new Howl({
      src: [COUNTDOWN_SOUND_URL],
      volume: 0.5,
      preload: true,
    });
  }
  return countdownSound;
}

function getTickSound(): Howl {
  if (!tickSound) {
    tickSound = new Howl({
      src: [COUNTDOWN_SOUND_URL],
      volume: 0.2, // Reduced from 0.3
      rate: 1.3,   // Slightly lower pitch (was 1.5)
      preload: true,
    });
  }
  return tickSound;
}

export function useTimeUrgency({
  timeLeft,
  totalTime,
  isPlaying,
  soundEnabled,
  warningThreshold = 0.5,
  urgentThreshold = 0.25,
  criticalSeconds = 10,
  countdownSeconds = 5,
}: UseTimeUrgencyOptions): UseTimeUrgencyReturn {
  // Track which thresholds have been triggered (to avoid repeats)
  const triggeredRef = useRef<Set<string>>(new Set());
  const lastSecondRef = useRef<number>(-1);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate time percentage
  const timePercent = totalTime > 0 ? timeLeft / totalTime : 1;

  // Determine urgency level
  const getUrgencyLevel = useCallback((): UrgencyLevel => {
    if (timeLeft <= countdownSeconds) return 'countdown';
    if (timeLeft <= criticalSeconds) return 'critical';
    if (timePercent <= urgentThreshold) return 'urgent';
    if (timePercent <= warningThreshold) return 'warning';
    return 'normal';
  }, [timeLeft, timePercent, warningThreshold, urgentThreshold, criticalSeconds, countdownSeconds]);

  const urgencyLevel = getUrgencyLevel();

  // Play warning sound with optional pitch/volume modifiers
  const playWarning = useCallback((volume: number = 0.4, rate: number = 1.0) => {
    if (!soundEnabled) return;
    const sound = getWarningSound();
    sound.volume(volume);
    sound.rate(rate);
    sound.play();
  }, [soundEnabled]);

  // Play countdown beep with escalating intensity (toned down)
  const playCountdown = useCallback((secondsLeft: number) => {
    if (!soundEnabled) return;
    const sound = getCountdownSound();

    // Escalate volume and pitch as time runs out (reduced intensity)
    const intensity = Math.max(0.2, 1 - (secondsLeft / countdownSeconds));
    sound.volume(0.3 + intensity * 0.2); // 0.3 to 0.5 (was 0.4 to 0.8)
    sound.rate(1.0 + intensity * 0.25);  // 1.0 to 1.25 (was 1.0 to 1.5)
    sound.play();
  }, [soundEnabled, countdownSeconds]);

  // Play tick sound for critical phase
  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    const sound = getTickSound();
    sound.play();
  }, [soundEnabled]);

  // Handle threshold triggers
  useEffect(() => {
    if (!isPlaying || !soundEnabled) return;

    const triggered = triggeredRef.current;

    // 50% warning - single beep
    if (timePercent <= warningThreshold && !triggered.has('warning')) {
      triggered.add('warning');
      playWarning(0.4, 1.0);
    }

    // 25% urgent - double beep (higher pitch)
    if (timePercent <= urgentThreshold && !triggered.has('urgent')) {
      triggered.add('urgent');
      playWarning(0.5, 1.2);
      setTimeout(() => playWarning(0.5, 1.3), 150);
    }

    // 10s critical - start ticking (toned down)
    if (timeLeft <= criticalSeconds && !triggered.has('critical')) {
      triggered.add('critical');
      playWarning(0.4, 1.2); // Reduced from 0.6, 1.4

      // Start tick interval (every 1000ms - was 500ms)
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      tickIntervalRef.current = setInterval(() => {
        if (soundEnabled) playTick();
      }, 1000);
    }

    // Stop ticking when entering final countdown
    if (timeLeft <= countdownSeconds && tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }

  }, [timePercent, timeLeft, isPlaying, soundEnabled, warningThreshold, urgentThreshold, criticalSeconds, countdownSeconds, playWarning, playTick]);

  // Handle per-second countdown (5, 4, 3, 2, 1)
  useEffect(() => {
    if (!isPlaying || !soundEnabled) return;

    // Only trigger once per second
    const currentSecond = Math.ceil(timeLeft);
    if (currentSecond === lastSecondRef.current) return;
    lastSecondRef.current = currentSecond;

    // Final countdown sounds (5, 4, 3, 2, 1)
    if (timeLeft <= countdownSeconds && timeLeft > 0) {
      playCountdown(timeLeft);
    }

  }, [timeLeft, isPlaying, soundEnabled, countdownSeconds, playCountdown]);

  // Reset triggers when game restarts
  useEffect(() => {
    if (!isPlaying) {
      triggeredRef.current.clear();
      lastSecondRef.current = -1;

      // Clear tick interval
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  return {
    urgencyLevel,
    timePercent,
  };
}

/**
 * Get CSS class for urgency level (for visual feedback)
 */
export function getUrgencyClass(level: UrgencyLevel): string {
  switch (level) {
    case 'countdown':
      return 'urgency-countdown';
    case 'critical':
      return 'urgency-critical';
    case 'urgent':
      return 'urgency-urgent';
    case 'warning':
      return 'urgency-warning';
    default:
      return '';
  }
}

/**
 * Get urgency color for UI elements
 */
export function getUrgencyColor(level: UrgencyLevel): string {
  switch (level) {
    case 'countdown':
      return '#ff0000'; // Red
    case 'critical':
      return '#ff4444'; // Light red
    case 'urgent':
      return '#ff8800'; // Orange
    case 'warning':
      return '#ffcc00'; // Yellow
    default:
      return '#ffffff'; // White
  }
}
