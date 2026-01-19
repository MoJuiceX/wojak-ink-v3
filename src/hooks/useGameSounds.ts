/**
 * Game Sounds Hook
 *
 * Provides sound effects for all games.
 * Uses MP3-based sounds from SoundManager when available,
 * with Web Audio API synthesized sounds as fallback.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useSettings } from '@/contexts/SettingsContext';
import { SoundManager } from '@/systems/audio/SoundManager';
import { getComboSound } from '@/systems/audio/sounds';

// Create audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  // Resume if suspended (browsers require user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Volume multiplier for scaling gain nodes
let volumeMultiplier = 1;

// ============================================
// SATISFYING "JUICE" SOUND DESIGN
// Philosophy: Soft, bubbly, organic - NOT harsh electronic
// Almost ALL positive reinforcement (Candy Crush style)
// ============================================

// Combo pitch frequencies (musical semitones C5 → C6)
const COMBO_FREQUENCIES = [
  523,  // C5  - combo 1
  587,  // D5  - combo 2
  659,  // E5  - combo 3
  784,  // G5  - combo 4
  880,  // A5  - combo 5
  1047, // C6  - combo max
];

// ============================================
// HELPER: Create soft, bubbly pop sound
// ============================================
const createSoftPop = (ctx: AudioContext | null, freq: number = 800, duration: number = 0.08) => {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Soft pop: quick frequency drop gives "bubble pop" feel
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    osc.type = 'sine';

    // Fast attack, smooth decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12 * volumeMultiplier, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

// ============================================
// HELPER: Create chime tail (satisfying resonance)
// ============================================
const createChimeTail = (ctx: AudioContext | null, freq: number = 1200, delay: number = 0.02) => {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    osc.type = 'sine';

    const startTime = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0.06 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.15);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

// ============================================
// HELPER: Create sparkle cascade
// ============================================
const createSparkleCascade = (ctx: AudioContext | null, count: number = 5, baseFreq: number = 1500) => {
  if (!ctx) return;
  try {
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Rising sparkle frequencies
      const freq = baseFreq + i * 200 + Math.random() * 100;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.04;
      gain.gain.setValueAtTime(0.05 * volumeMultiplier, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.12);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    }
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

// ============================================
// WIN/LEVEL COMPLETE SOUNDS (5 variations)
// ============================================

// Triumphant sparkle cascade + chord
const createWinSparkle = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Major chord (C5, E5, G5)
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.03;
      gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.5);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });

    // Sparkle overlay
    createSparkleCascade(ctx, 6, 1800);
  } catch (e) {
    // Silently fail
  }
};

// Ascending arpeggio (C5 → E5 → G5 → C6)
const createWinArpeggio = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'triangle';

      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1 * volumeMultiplier, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.25);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch (e) {
    // Silently fail
  }
};

// Bubbly celebration (multiple soft pops)
const createWinBubbles = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Rising frequency pops
    [600, 800, 1000, 1200, 1400].forEach((freq, i) => {
      setTimeout(() => {
        createSoftPop(ctx, freq, 0.1);
      }, i * 50);
    });
  } catch (e) {
    // Silently fail
  }
};

// Gentle bell chime
const createWinBell = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    // Bell: fundamental + overtone
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.setValueAtTime(880 * 2.4, ctx.currentTime); // Bell overtone ratio
    osc.type = 'sine';
    osc2.type = 'sine';

    gain.gain.setValueAtTime(0.12 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);

    // Add sparkle
    createSparkleCascade(ctx, 4, 2000);
  } catch (e) {
    // Silently fail
  }
};

// Magical shimmer
const createWinShimmer = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Multiple detuned oscillators for shimmer
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const baseFreq = 1047; // C6
      const detune = (i - 1.5) * 8; // Slight detune for shimmer
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.8);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch (e) {
    // Silently fail
  }
};

const WIN_SOUNDS = [
  createWinSparkle,
  createWinArpeggio,
  createWinBubbles,
  createWinBell,
  createWinShimmer,
];

// ============================================
// GAME ACTION SOUNDS
// ============================================

/**
 * Score/Block Land: Soft POP + subtle chime tail
 * Like bubble popping, 50-80ms, ~800Hz with harmonic
 */
const createBlockLandSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Main soft pop
    createSoftPop(ctx, 800, 0.06);

    // Subtle chime tail for satisfaction
    createChimeTail(ctx, 1200, 0.02);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

/**
 * Perfect Bonus: Sparkle cascade + bright chord
 * Pure celebration - rising frequencies
 */
const createPerfectBonusSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Quick ascending two-note chime (C5 → E5)
    [523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.18);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });

    // Add sparkle overlay
    createSparkleCascade(ctx, 4, 1600);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

/**
 * Combo Sound: Escalating pitch (C5 → C6)
 * THE ADDICTION ENGINE - each level rises by semitone/third
 * Makes players subconsciously want to hear the NEXT sound
 */
const createComboSound = (comboLevel: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Get frequency based on combo level (capped at C6)
    const freqIndex = Math.min(comboLevel - 1, COMBO_FREQUENCIES.length - 1);
    const baseFreq = COMBO_FREQUENCIES[Math.max(0, freqIndex)];

    // Main bubbly pop
    createSoftPop(ctx, baseFreq, 0.08 + comboLevel * 0.01);

    // Chime that gets brighter with higher combos
    createChimeTail(ctx, baseFreq * 1.5, 0.015);

    // Add sparkle at higher combos
    if (comboLevel >= 3) {
      createSparkleCascade(ctx, Math.min(comboLevel - 1, 4), baseFreq * 2);
    }

    // At max combo, add magical shimmer
    if (comboLevel >= 6) {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const detune = (i - 1) * 12;
        osc.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
        osc.detune.setValueAtTime(detune, ctx.currentTime);
        osc.type = 'sine';

        const startTime = ctx.currentTime + 0.05;
        gain.gain.setValueAtTime(0.04 * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.3);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      }
    }
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

// Orange Pong sounds

/**
 * Paddle Hit: Satisfying "thock" - soft but present
 */
const createPaddleHitSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Soft thock
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
  osc.type = 'sine'; // Softer than square

  gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.06);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);

  // Light chime tail
  createChimeTail(ctx, 800, 0.02);
};

/**
 * Wall Bounce: Subtle soft tap
 */
const createWallBounceSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Very subtle pop
  createSoftPop(ctx, 500, 0.04);
};

/**
 * Score Point: Rising chime - satisfying "you scored!"
 */
const createScorePointSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Rising two-note chime
  [523, 659].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.15);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
};

// Brick Breaker sounds

/**
 * Ball Launch: Ascending whoosh/ping when ball is launched
 * 150-200ms, energetic, conveys momentum
 */
const createBallLaunchSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Main ascending sweep (whoosh)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Rising frequency for launch feel
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.18);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);

    // Add a bright "ping" at the peak
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();

    ping.connect(pingGain);
    pingGain.connect(ctx.destination);

    ping.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
    ping.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
    ping.type = 'sine';

    pingGain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime + 0.08);
    pingGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.2);

    ping.start(ctx.currentTime + 0.08);
    ping.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Normal Brick Destroy: Satisfying pop/crunch when normal brick is destroyed
 * 100-150ms, crisp, rewarding
 * Has 4 variations to prevent audio fatigue
 */
const brickDestroyVariations = [
  // Variation 1: Classic pop/crunch (original)
  (ctx: AudioContext, isStrong: boolean, basePitch: number, baseVolume: number) => {
    const pitchVariation = 0.9 + Math.random() * 0.2;
    const baseFreq = 500 * basePitch * pitchVariation;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, ctx.currentTime + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(baseVolume * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);

    // Noise layer
    const noiseLength = isStrong ? 0.15 : 0.1;
    const bufferSize = ctx.sampleRate * noiseLength;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / (bufferSize * 0.3));
      noiseData[i] = (Math.random() * 2 - 1) * envelope;
    }
    const noiseSource = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isStrong ? 1500 : 2000, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1, ctx.currentTime);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime((isStrong ? 0.08 : 0.06) * volumeMultiplier, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + noiseLength);
    noiseSource.start(ctx.currentTime);

    if (!isStrong) {
      const pop = ctx.createOscillator();
      const popGain = ctx.createGain();
      pop.connect(popGain);
      popGain.connect(ctx.destination);
      pop.frequency.setValueAtTime(1200 * pitchVariation, ctx.currentTime);
      pop.frequency.exponentialRampToValueAtTime(600 * pitchVariation, ctx.currentTime + 0.04);
      pop.type = 'sine';
      popGain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.05);
      pop.start(ctx.currentTime);
      pop.stop(ctx.currentTime + 0.05);
    }
  },
  // Variation 2: Bubbly pop
  (ctx: AudioContext, _isStrong: boolean, basePitch: number, baseVolume: number) => {
    const pitchVariation = 0.92 + Math.random() * 0.16;
    const baseFreq = 550 * basePitch * pitchVariation;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq * 1.2, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + 0.08);
    osc.type = 'sine';
    gain.gain.setValueAtTime(baseVolume * 0.9 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Bubble overtone
    const bubble = ctx.createOscillator();
    const bubbleGain = ctx.createGain();
    bubble.connect(bubbleGain);
    bubbleGain.connect(ctx.destination);
    bubble.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime + 0.01);
    bubble.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.06);
    bubble.type = 'sine';
    bubbleGain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime + 0.01);
    bubbleGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.07);
    bubble.start(ctx.currentTime + 0.01);
    bubble.stop(ctx.currentTime + 0.07);
  },
  // Variation 3: Snappy crack
  (ctx: AudioContext, isStrong: boolean, basePitch: number, baseVolume: number) => {
    const pitchVariation = 0.88 + Math.random() * 0.24;
    const baseFreq = 480 * basePitch * pitchVariation;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, ctx.currentTime + 0.07);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(baseVolume * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);

    // Sharp transient
    const noiseLength = 0.04;
    const bufferSize = ctx.sampleRate * noiseLength;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / (bufferSize * 0.15));
      noiseData[i] = (Math.random() * 2 - 1) * envelope;
    }
    const noiseSource = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(isStrong ? 1800 : 2500, ctx.currentTime);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime((isStrong ? 0.09 : 0.07) * volumeMultiplier, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + noiseLength);
    noiseSource.start(ctx.currentTime);
  },
  // Variation 4: Chunky crumble
  (ctx: AudioContext, _isStrong: boolean, basePitch: number, baseVolume: number) => {
    const pitchVariation = 0.85 + Math.random() * 0.3;
    const baseFreq = 420 * basePitch * pitchVariation;

    // Lower, heavier thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, ctx.currentTime + 0.12);
    osc.type = 'sine';
    gain.gain.setValueAtTime(baseVolume * 1.1 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.14);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);

    // Crumbly noise with multiple frequencies
    for (let j = 0; j < 2; j++) {
      const crumb = ctx.createOscillator();
      const crumbGain = ctx.createGain();
      crumb.connect(crumbGain);
      crumbGain.connect(ctx.destination);
      crumb.frequency.setValueAtTime(baseFreq * (1.5 + j * 0.5), ctx.currentTime + j * 0.02);
      crumb.frequency.exponentialRampToValueAtTime(baseFreq * (0.5 + j * 0.2), ctx.currentTime + 0.06 + j * 0.02);
      crumb.type = 'triangle';
      crumbGain.gain.setValueAtTime(0.04 * volumeMultiplier, ctx.currentTime + j * 0.02);
      crumbGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.08 + j * 0.02);
      crumb.start(ctx.currentTime + j * 0.02);
      crumb.stop(ctx.currentTime + 0.08 + j * 0.02);
    }
  },
];

const createBrickBreakerBrickDestroySound = (brickType: 'normal' | 'strong' = 'normal') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const isStrong = brickType === 'strong';
    const baseVolume = isStrong ? 0.14 : 0.12;
    const basePitch = isStrong ? 0.85 : 1.0;

    // Randomly select a variation
    const variation = brickDestroyVariations[Math.floor(Math.random() * brickDestroyVariations.length)];
    variation(ctx, isStrong, basePitch, baseVolume);
  } catch (e) {
    // Silently fail
  }
};

// Brick Breaker anticipation loop state
let brickBreakerAnticipationOsc: OscillatorNode | null = null;
let brickBreakerAnticipationGain: GainNode | null = null;

// Brick Breaker fireball loop state
let brickBreakerFireballOsc: OscillatorNode | null = null;
let brickBreakerFireballOsc2: OscillatorNode | null = null;
let brickBreakerFireballGain: GainNode | null = null;
let brickBreakerFireballNoiseSource: AudioBufferSourceNode | null = null;

/**
 * Brick Breaker Anticipation Loop: Tension-building sound when 1-3 bricks remain
 * Quieter, subtle tone that plays for 2 seconds then slowly fades out over 6 seconds
 */
const startBrickBreakerAnticipation = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx || brickBreakerAnticipationOsc) return; // Already playing

    brickBreakerAnticipationOsc = ctx.createOscillator();
    brickBreakerAnticipationGain = ctx.createGain();

    brickBreakerAnticipationOsc.connect(brickBreakerAnticipationGain);
    brickBreakerAnticipationGain.connect(ctx.destination);

    // Subtle pulsing tone (slightly lower frequency for less intensity)
    brickBreakerAnticipationOsc.frequency.setValueAtTime(180, ctx.currentTime);
    brickBreakerAnticipationOsc.type = 'sine';

    // Volume envelope:
    // - Quick fade in (0.3s)
    // - Hold at normal volume for 2 seconds
    // - Slow fade out over 6 seconds
    const maxVolume = 0.035 * volumeMultiplier; // Quieter than before (was 0.06)
    const fadeInEnd = ctx.currentTime + 0.3;
    const holdEnd = fadeInEnd + 2; // Hold for 2 seconds
    const fadeOutEnd = holdEnd + 6; // Fade out over 6 seconds

    brickBreakerAnticipationGain.gain.setValueAtTime(0, ctx.currentTime);
    brickBreakerAnticipationGain.gain.linearRampToValueAtTime(maxVolume, fadeInEnd);
    brickBreakerAnticipationGain.gain.setValueAtTime(maxVolume, holdEnd); // Hold
    brickBreakerAnticipationGain.gain.linearRampToValueAtTime(0, fadeOutEnd); // Slow 6s fade

    brickBreakerAnticipationOsc.start(ctx.currentTime);
    brickBreakerAnticipationOsc.stop(fadeOutEnd + 0.1); // Stop after fade completes

    // Add very subtle LFO for gentle pulsing effect (slower pulse)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    lfo.frequency.setValueAtTime(1.5, ctx.currentTime); // Slower pulse (was 2Hz)
    lfoGain.gain.setValueAtTime(0.01 * volumeMultiplier, ctx.currentTime); // Less intense pulse

    lfo.connect(lfoGain);
    lfoGain.connect(brickBreakerAnticipationGain.gain);
    lfo.start(ctx.currentTime);
    lfo.stop(fadeOutEnd + 0.1);

    // Auto-cleanup after sound ends
    setTimeout(() => {
      brickBreakerAnticipationOsc = null;
      brickBreakerAnticipationGain = null;
    }, (fadeOutEnd - ctx.currentTime + 0.2) * 1000);
  } catch (e) {
    // Silently fail
  }
};

const stopBrickBreakerAnticipation = () => {
  try {
    if (brickBreakerAnticipationOsc && brickBreakerAnticipationGain) {
      const ctx = getAudioContext();
      if (ctx) {
        // Cancel any scheduled values and fade out quickly
        brickBreakerAnticipationGain.gain.cancelScheduledValues(ctx.currentTime);
        brickBreakerAnticipationGain.gain.setValueAtTime(
          brickBreakerAnticipationGain.gain.value,
          ctx.currentTime
        );
        brickBreakerAnticipationGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            brickBreakerAnticipationOsc?.stop();
          } catch (e) {
            // Already stopped
          }
          brickBreakerAnticipationOsc = null;
          brickBreakerAnticipationGain = null;
        }, 550);
      }
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Fireball Loop: Ambient fire/flame sound while fireball powerup is active
 * Crackly, fiery - conveys power and urgency
 */
const startBrickBreakerFireball = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx || brickBreakerFireballOsc) return; // Already playing

    // Create master gain node
    brickBreakerFireballGain = ctx.createGain();
    brickBreakerFireballGain.connect(ctx.destination);

    // Low rumble oscillator (fire base)
    brickBreakerFireballOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    brickBreakerFireballOsc.connect(rumbleGain);
    rumbleGain.connect(brickBreakerFireballGain);

    brickBreakerFireballOsc.frequency.setValueAtTime(80, ctx.currentTime);
    brickBreakerFireballOsc.type = 'sawtooth';
    rumbleGain.gain.setValueAtTime(0.04 * volumeMultiplier, ctx.currentTime);

    // Add LFO for flickering effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(8, ctx.currentTime); // 8Hz flicker
    lfoGain.gain.setValueAtTime(0.02 * volumeMultiplier, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(rumbleGain.gain);
    lfo.start(ctx.currentTime);

    // Higher crackling oscillator
    brickBreakerFireballOsc2 = ctx.createOscillator();
    const crackleGain = ctx.createGain();
    brickBreakerFireballOsc2.connect(crackleGain);
    crackleGain.connect(brickBreakerFireballGain);

    brickBreakerFireballOsc2.frequency.setValueAtTime(200, ctx.currentTime);
    brickBreakerFireballOsc2.type = 'sawtooth';
    crackleGain.gain.setValueAtTime(0.02 * volumeMultiplier, ctx.currentTime);

    // Second LFO for crackle variation
    const lfo2 = ctx.createOscillator();
    const lfo2Gain = ctx.createGain();
    lfo2.frequency.setValueAtTime(12, ctx.currentTime); // Faster flicker
    lfo2Gain.gain.setValueAtTime(0.015 * volumeMultiplier, ctx.currentTime);
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(crackleGain.gain);
    lfo2.start(ctx.currentTime);

    // Noise layer for fire crackle
    const noiseLength = 2; // 2 second loop
    const bufferSize = ctx.sampleRate * noiseLength;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Random crackle pattern
      noiseData[i] = (Math.random() * 2 - 1) * (Math.random() > 0.95 ? 1 : 0.3);
    }

    brickBreakerFireballNoiseSource = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    brickBreakerFireballNoiseSource.buffer = noiseBuffer;
    brickBreakerFireballNoiseSource.loop = true;

    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(2, ctx.currentTime);

    brickBreakerFireballNoiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(brickBreakerFireballGain);
    noiseGain.gain.setValueAtTime(0.03 * volumeMultiplier, ctx.currentTime);

    // Fade in
    brickBreakerFireballGain.gain.setValueAtTime(0, ctx.currentTime);
    brickBreakerFireballGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.3);

    // Start all
    brickBreakerFireballOsc.start(ctx.currentTime);
    brickBreakerFireballOsc2.start(ctx.currentTime);
    brickBreakerFireballNoiseSource.start(ctx.currentTime);
  } catch (e) {
    // Silently fail
  }
};

const stopBrickBreakerFireball = () => {
  try {
    if (brickBreakerFireballGain) {
      const ctx = getAudioContext();
      if (ctx) {
        // Fade out
        brickBreakerFireballGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        setTimeout(() => {
          try {
            brickBreakerFireballOsc?.stop();
            brickBreakerFireballOsc2?.stop();
            brickBreakerFireballNoiseSource?.stop();
          } catch (e) {
            // Already stopped
          }
          brickBreakerFireballOsc = null;
          brickBreakerFireballOsc2 = null;
          brickBreakerFireballGain = null;
          brickBreakerFireballNoiseSource = null;
        }, 350);
      }
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Combo Sound: Escalating pitch and layers with combo count
 * The addiction engine - each level rises, makes players want to hear NEXT sound
 */
const createBrickBreakerComboSound = (combo: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx || combo < 3) return;

    // Escalating parameters
    const pitch = Math.min(1.0 + (combo - 3) * 0.1, 1.5);
    const volume = Math.min(0.4 + (combo - 3) * 0.05, 0.65);
    const baseFreq = 523 * pitch; // C5 scaled by pitch

    // Main combo chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, ctx.currentTime + 0.08);
    osc.type = 'sine';

    gain.gain.setValueAtTime(volume * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    // Add sparkle layer at combo 5+
    if (combo >= 5) {
      for (let i = 0; i < Math.min(combo - 3, 4); i++) {
        const sparkle = ctx.createOscillator();
        const sparkleGain = ctx.createGain();

        sparkle.connect(sparkleGain);
        sparkleGain.connect(ctx.destination);

        const sparkleFreq = baseFreq * 2 + i * 200 + Math.random() * 100;
        sparkle.frequency.setValueAtTime(sparkleFreq, ctx.currentTime);
        sparkle.type = 'sine';

        const startTime = ctx.currentTime + 0.03 + i * 0.02;
        sparkleGain.gain.setValueAtTime(0.04 * volumeMultiplier, startTime);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.1);

        sparkle.start(startTime);
        sparkle.stop(startTime + 0.1);
      }
    }

    // Add bass hit at combo 8+
    if (combo >= 8) {
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bass.connect(bassGain);
      bassGain.connect(ctx.destination);

      bass.frequency.setValueAtTime(80, ctx.currentTime);
      bass.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
      bass.type = 'sine';

      bassGain.gain.setValueAtTime(0.15 * volumeMultiplier, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);

      bass.start(ctx.currentTime);
      bass.stop(ctx.currentTime + 0.12);
    }

    // Full celebration shimmer at combo 10+
    if (combo >= 10) {
      for (let i = 0; i < 3; i++) {
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();

        shimmer.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);

        shimmer.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
        shimmer.detune.setValueAtTime((i - 1) * 10, ctx.currentTime);
        shimmer.type = 'sine';

        const startTime = ctx.currentTime + 0.05;
        shimmerGain.gain.setValueAtTime(0.05 * volumeMultiplier, startTime);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.25);

        shimmer.start(startTime);
        shimmer.stop(startTime + 0.25);
      }
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Combo Break: Soft "plink-down" when combo is lost
 * Not harsh - subtle disappointment, encourages trying again
 */
const createBrickBreakerComboBreakSound = (lostCombo: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx || lostCombo < 3) return; // Only for meaningful combos

    // Descending tone - opposite of combo escalation
    const baseFreq = 400 + Math.min(lostCombo, 10) * 20;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.2);
    osc.type = 'sine';

    const vol = Math.min(0.15 + lostCombo * 0.02, 0.3) * volumeMultiplier;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Ball Lost: Descending "womp" when ball falls off bottom
 * 300-400ms, deflating, NOT game over - just a setback
 */
const createBrickBreakerBallLostSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Descending tone - "womp"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Falling frequency
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.35);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.12 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);

    // Add subtle "aww" undertone
    const undertone = ctx.createOscillator();
    const undertoneGain = ctx.createGain();

    undertone.connect(undertoneGain);
    undertoneGain.connect(ctx.destination);

    undertone.frequency.setValueAtTime(300, ctx.currentTime + 0.05);
    undertone.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
    undertone.type = 'sine';

    undertoneGain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime + 0.05);
    undertoneGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.4);

    undertone.start(ctx.currentTime + 0.05);
    undertone.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Powerup Collect: Type-specific sounds for collecting powerups
 * Each type has a distinct character to build recognition
 */
const createBrickBreakerPowerupCollectSound = (type: string) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    switch (type) {
      case 'expand': {
        // Stretching/growing sound - elastic feel
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);

        // Add "boing" overtone
        const boing = ctx.createOscillator();
        const boingGain = ctx.createGain();
        boing.connect(boingGain);
        boingGain.connect(ctx.destination);

        boing.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
        boing.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
        boing.type = 'sine';

        boingGain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime + 0.05);
        boingGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.18);

        boing.start(ctx.currentTime + 0.05);
        boing.stop(ctx.currentTime + 0.18);
        break;
      }

      case 'multiball': {
        // Split/multiply - bubbly pops
        [400, 600, 800].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.08);
          osc.type = 'sine';

          const startTime = ctx.currentTime + i * 0.06;
          gain.gain.setValueAtTime(0.08 * volumeMultiplier, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.1);

          osc.start(startTime);
          osc.stop(startTime + 0.1);
        });
        break;
      }

      case 'fireball': {
        // Ignition whoosh - fiery
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);

        // Add crackle noise
        const noiseLength = 0.15;
        const bufferSize = ctx.sampleRate * noiseLength;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const envelope = Math.exp(-i / (bufferSize * 0.4));
          noiseData[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noiseSource = ctx.createBufferSource();
        const noiseFilter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();

        noiseSource.buffer = noiseBuffer;
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseGain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.2);

        noiseSource.start(ctx.currentTime + 0.05);
        break;
      }

      case 'slow': {
        // Deceleration - winding down
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      }

      case 'extralife': {
        // Triumphant celebration - rising chord
        const notes = [523, 659, 784]; // C, E, G (major chord)

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.type = 'sine';

          const startTime = ctx.currentTime + i * 0.05;
          gain.gain.setValueAtTime(0.08 * volumeMultiplier, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.25);

          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });

        // Add sparkle
        createSparkleCascade(ctx, 4, 1600);
        break;
      }

      default: {
        // Generic powerup sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Powerup Spawn: Sparkle/chime when powerup drops from destroyed brick
 * 200-300ms, magical, conveys something special
 */
const createBrickBreakerPowerupSpawnSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Magical sparkle chime
    const notes = [1200, 1500, 1800]; // Rising sparkle

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.06 * volumeMultiplier, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });

    // Add subtle shimmer overlay
    for (let i = 0; i < 3; i++) {
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);

      const shimmerFreq = 2000 + Math.random() * 500;
      shimmer.frequency.setValueAtTime(shimmerFreq, ctx.currentTime);
      shimmer.type = 'sine';

      const startTime = ctx.currentTime + 0.08 + i * 0.03;
      shimmerGain.gain.setValueAtTime(0.03 * volumeMultiplier, startTime);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.1);

      shimmer.start(startTime);
      shimmer.stop(startTime + 0.1);
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Unbreakable Brick Hit: Metallic clang when hitting gray unbreakable bricks
 * 80-100ms, solid metallic thunk, conveys immovable obstacle
 */
const createBrickBreakerUnbreakableHitSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Metallic clang - two detuned oscillators for bell-like quality
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    // Random slight pitch variation
    const pitchVariation = 0.95 + Math.random() * 0.1;
    const baseFreq = 180 * pitchVariation;

    // Low fundamental + high metallic overtone
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.08);
    osc1.type = 'triangle';

    osc2.frequency.setValueAtTime(baseFreq * 4.5, ctx.currentTime); // Metallic overtone
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, ctx.currentTime + 0.06);
    osc2.type = 'sine';

    gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.1);

    // Add subtle metallic "ring" decay
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();

    ring.connect(ringGain);
    ringGain.connect(ctx.destination);

    ring.frequency.setValueAtTime(baseFreq * 6, ctx.currentTime);
    ring.type = 'sine';

    ringGain.gain.setValueAtTime(0.03 * volumeMultiplier, ctx.currentTime + 0.02);
    ringGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.15);

    ring.start(ctx.currentTime + 0.02);
    ring.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Strong Brick Crack: Sound when strong brick is hit but not destroyed
 * 100-120ms, stone/concrete crack, conveys damage but not destruction
 */
const createBrickBreakerBrickCrackSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Sharp crack sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Random pitch variation
    const pitchVariation = 0.9 + Math.random() * 0.2;
    const baseFreq = 300 * pitchVariation;

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + 0.08);
    osc.type = 'triangle'; // Slightly harsher than sine

    gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Add sharp "crack" noise burst
    const crackLength = 0.06;
    const bufferSize = ctx.sampleRate * crackLength;
    const crackBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const crackData = crackBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / (bufferSize * 0.15)); // Very quick decay
      crackData[i] = (Math.random() * 2 - 1) * envelope;
    }

    const crackSource = ctx.createBufferSource();
    const crackFilter = ctx.createBiquadFilter();
    const crackGain = ctx.createGain();

    crackSource.buffer = crackBuffer;
    crackFilter.type = 'highpass';
    crackFilter.frequency.setValueAtTime(1000, ctx.currentTime);

    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(ctx.destination);

    crackGain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
    crackGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + crackLength);

    crackSource.start(ctx.currentTime);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Wall Hit: Subtle ping when ball bounces off walls
 * 50-80ms, clean, quieter than paddle/brick hits
 * Has 4 variations to prevent audio fatigue
 */
const wallHitVariations = [
  // Variation 1: Clean ping (original)
  (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const baseFreq = 600 + Math.random() * 100;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.05);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  },
  // Variation 2: Softer, lower tap
  (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const baseFreq = 500 + Math.random() * 80;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, ctx.currentTime + 0.04);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },
  // Variation 3: Brighter tick
  (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const baseFreq = 700 + Math.random() * 120;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.035);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.055 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.045);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.045);
  },
  // Variation 4: Subtle double-tap
  (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    const baseFreq = 550 + Math.random() * 90;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.03);
    osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.015);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.05);
    osc.type = 'sine';
    osc2.type = 'sine';
    gain.gain.setValueAtTime(0.04 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.055);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.015);
    osc.stop(ctx.currentTime + 0.03);
    osc2.stop(ctx.currentTime + 0.055);
  },
];

const createBrickBreakerWallHitSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Randomly select a variation
    const variation = wallHitVariations[Math.floor(Math.random() * wallHitVariations.length)];
    variation(ctx);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Brick Breaker Paddle Hit: Rubbery thwack with pitch variation based on hit position
 * 80-120ms, edges = higher pitch
 * hitPosition: 0 = left edge, 0.5 = center, 1 = right edge
 * Has 3 character variations to prevent audio fatigue
 */
const paddleHitVariations = [
  // Variation 1: Classic rubbery thwack (original)
  (ctx: AudioContext, pitchMultiplier: number) => {
    const baseFreq = 350 * pitchMultiplier;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + 0.08);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.12 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Boing overtone
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);
    overtone.frequency.setValueAtTime(baseFreq * 2.5, ctx.currentTime);
    overtone.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, ctx.currentTime + 0.06);
    overtone.type = 'sine';
    overtoneGain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.08);
    overtone.start(ctx.currentTime);
    overtone.stop(ctx.currentTime + 0.08);
  },
  // Variation 2: Snappier, shorter thwack
  (ctx: AudioContext, pitchMultiplier: number) => {
    const baseFreq = 380 * pitchMultiplier;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, ctx.currentTime + 0.06);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.11 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);

    // Quick high tap
    const tap = ctx.createOscillator();
    const tapGain = ctx.createGain();
    tap.connect(tapGain);
    tapGain.connect(ctx.destination);
    tap.frequency.setValueAtTime(baseFreq * 3, ctx.currentTime);
    tap.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.03);
    tap.type = 'sine';
    tapGain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime);
    tapGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.04);
    tap.start(ctx.currentTime);
    tap.stop(ctx.currentTime + 0.04);
  },
  // Variation 3: Softer, bouncier hit
  (ctx: AudioContext, pitchMultiplier: number) => {
    const baseFreq = 320 * pitchMultiplier;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);

    // Warmer overtone
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);
    overtone.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
    overtone.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.08);
    overtone.type = 'sine';
    overtoneGain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.1);
    overtone.start(ctx.currentTime);
    overtone.stop(ctx.currentTime + 0.1);
  },
];

const createBrickBreakerPaddleHitSound = (hitPosition: number = 0.5) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Base pitch varies based on hit position (edges = higher)
    const basePitch = 1.0;
    const pitchVariation = Math.abs(hitPosition - 0.5) * 0.3; // ±15% at edges
    const pitchMultiplier = basePitch + pitchVariation;

    // Randomly select a variation
    const variation = paddleHitVariations[Math.floor(Math.random() * paddleHitVariations.length)];
    variation(ctx, pitchMultiplier);
  } catch (e) {
    // Silently fail
  }
};

// Wojak Runner sounds

/**
 * Collect: Coin "clink" + light sparkle
 * Classic satisfying coin sound, high metallic ~2kHz
 */
const createCollectSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Main coin clink
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(2000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.08);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);

  // Tiny sparkle
  createSparkleCascade(ctx, 2, 2200);
};

/**
 * Whoosh: Smooth air swoosh - light and playful
 */
const createWhooshSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Filtered noise for smooth whoosh
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // Smooth envelope
    const envelope = Math.sin((i / bufferSize) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.12);
  filter.Q.setValueAtTime(1, ctx.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);

  source.start(ctx.currentTime);
};

/**
 * Speed Up: Whoosh + bright ascending stab
 */
const createSpeedUpSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Quick ascending sweep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.15);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);

  // Bright stab at end
  createChimeTail(ctx, 1200, 0.1);
};

/**
 * Footstep: Soft thump - not intrusive
 */
const createFootstepSound = (pitch: number = 1) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Soft low thud
  osc.frequency.setValueAtTime(100 * pitch, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60 * pitch, ctx.currentTime + 0.04);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.04 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.06);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
};

// Running rhythm loop state
let runningLoopInterval: number | null = null;
let runningLoopStep = 0;

const startRunningLoop = (bpm: number = 180) => {
  if (runningLoopInterval) return;

  const intervalMs = (60 / bpm) * 1000 / 2;
  runningLoopStep = 0;

  runningLoopInterval = window.setInterval(() => {
    const pitch = runningLoopStep % 2 === 0 ? 1.0 : 1.08;
    createFootstepSound(pitch);
    runningLoopStep++;
  }, intervalMs);
};

const stopRunningLoop = () => {
  if (runningLoopInterval) {
    clearInterval(runningLoopInterval);
    runningLoopInterval = null;
    runningLoopStep = 0;
  }
};

// Memory Match sounds

/**
 * Card Hover: Ultra-subtle tick before clicking
 * 30-50ms, very quiet, high-pitched airy sound
 */
let lastHoverTime = 0;
const HOVER_DEBOUNCE = 50; // ms between hover sounds

const createCardHoverSound = () => {
  try {
    // Debounce to prevent spam during rapid mouse movement
    const now = Date.now();
    if (now - lastHoverTime < HOVER_DEBOUNCE) return;
    lastHoverTime = now;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Ultra-subtle high tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.03);
    osc.type = 'sine';

    // Very quiet - just a hint
    gain.gain.setValueAtTime(0.03 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.035);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Card Flip: Soft "tik" - like gentle tap on glass
 * 20-30ms, subtle, not intrusive
 * With random pitch variation to prevent audio fatigue
 */
const createCardFlipSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Random pitch variation (±10%)
    const pitchVariation = 0.9 + Math.random() * 0.2;
    const baseFreq = 1500 * pitchVariation;
    const endFreq = 800 * pitchVariation;

    // Soft click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.025);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.03);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

/**
 * Match Found: Bubbly two-note rising chime with streak escalation
 * Streak 1: Normal match - basic chime
 * Streak 2: Very good - higher pitch + extra sparkle
 * Streak 3+: Max celebration - full excitement
 */
const createMatchFoundSound = (streak: number = 1) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Base frequencies increase with streak + slight random variation (±5%)
    const randomVariation = 0.95 + Math.random() * 0.1;
    const pitchMultiplier = (streak >= 3 ? 1.15 : streak === 2 ? 1.08 : 1.0) * randomVariation;
    const baseFreqs = [523 * pitchMultiplier, 659 * pitchMultiplier];

    // Volume increases slightly with streak
    const baseVolume = streak >= 3 ? 0.12 : streak === 2 ? 0.11 : 0.1;

    // Rising two-note chime (C5 → E5, pitched up for streaks)
    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(baseVolume * volumeMultiplier, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });

    // Sparkle intensity increases with streak
    if (streak >= 3) {
      // Max celebration - rich sparkle cascade
      createSparkleCascade(ctx, 5, 1600);
      // Add a third harmony note for max streak
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(784 * pitchMultiplier, ctx.currentTime); // G5
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime + 0.16);
      gain3.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.3);
      osc3.start(ctx.currentTime + 0.16);
      osc3.stop(ctx.currentTime + 0.3);
    } else if (streak === 2) {
      // Very good - extra sparkle
      createSparkleCascade(ctx, 3, 1500);
    } else {
      // Normal - light sparkle
      createSparkleCascade(ctx, 2, 1400);
    }
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

/**
 * Fast Match Bonus: Extra "zing" layer for quick matches (under 2.5s)
 * Adds energy on top of the normal match sound
 */
const createFastMatchBonus = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Quick ascending "zing" sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Rising frequency sweep
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.12);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    // Add a subtle "whoosh" overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
    osc2.type = 'sine';

    gain2.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.12);

    osc2.start(ctx.currentTime + 0.02);
    osc2.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Near-Completion Anticipation: Building tension as finish line approaches
 * 2 pairs left: Subtle rising shimmer
 * 1 pair left: More intense anticipation
 */
const createAnticipationSound = (pairsRemaining: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (pairsRemaining === 2) {
      // Subtle rising shimmer - gentle excitement
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);

      // Add subtle sparkle
      createSparkleCascade(ctx, 2, 1600);
    } else if (pairsRemaining === 1) {
      // More intense - you're almost there!
      // Rising two-tone with shimmer overlay
      [900, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, ctx.currentTime + 0.25);
        osc.type = 'sine';

        const startTime = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.06 * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, startTime + 0.3);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });

      // Richer sparkle
      createSparkleCascade(ctx, 4, 1800);
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Mismatch: Soft "bonk" - almost cute
 * Low thud (150Hz), quick, NO harsh buzz
 * NOT punishing - light-hearted
 * With random pitch variation
 */
const createMismatchSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Random pitch variation (±8%)
    const pitchVariation = 0.92 + Math.random() * 0.16;
    const baseFreq = 180 * pitchVariation;
    const endFreq = 120 * pitchVariation;

    // Soft low bonk
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.08);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

/**
 * Game Over: Gentle descending hum + soft "aww"
 * NOT punishing - light-hearted like Candy Crush fail
 * We want players to try again, not feel bad
 */
const createGameOverSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Gentle descending hum (not harsh)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Soft falling frequency
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);

    // Soft "aww" undertone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.5);
    osc2.type = 'sine';

    gain2.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.5);

    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

// ============================================
// ORANGE JUGGLE SOUNDS
// ============================================

/**
 * Orange Juggle Hit Sound: Bouncy "boing" when orangutan hits an orange
 * Position-based pitch variation for variety
 */
const createOrangeJuggleHitSound = (hitPosition: number = 0.5) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Rubbery boing with pitch variation based on hit position
    osc.type = 'sine';
    const basePitch = 280;
    const pitchVariation = (hitPosition - 0.5) * 80; // Edge hits = higher pitch
    osc.frequency.setValueAtTime(basePitch + pitchVariation, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.35 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Orange Drop Sound: Descending "womp" when orange is missed
 */
const createOrangeDropSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Descending tone - disappointment but not harsh
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Golden Orange Hit Sound: Magical chime with sparkle layer
 */
const createGoldenOrangeHitSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Layer 1: Base chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // High A
    gain1.gain.setValueAtTime(0.25 * volumeMultiplier, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.3);

    // Layer 2: Harmonic sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime); // High E
    osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.1); // Higher A
    gain2.gain.setValueAtTime(0.15 * volumeMultiplier, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.4);

    // Layer 3: Shimmer (filtered noise)
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 8000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001 * volumeMultiplier, ctx.currentTime + 0.3);

    // Connect all
    osc1.connect(gain1).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    noise.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.4);
    noise.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Banana Collect Sound: Happy ascending arpeggio
 */
const createBananaCollectSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523, 659, 784]; // C5, E5, G5 - happy major arpeggio

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3 * volumeMultiplier, ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + i * 0.08 + 0.15);

      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  } catch (e) {
    // Silently fail
  }
};

/**
 * Rum Collect Sound: Sloshing "glug-glug" with woozy warble
 */
const createRumCollectSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Glug 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.1);
    gain1.gain.setValueAtTime(0.25 * volumeMultiplier, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);

    // Glug 2 (delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
    osc2.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.2 * volumeMultiplier, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.28);

    // Woozy warble overlay
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5; // Slow wobble
    lfoGain.gain.value = 30;

    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    mainOsc.type = 'triangle';
    mainOsc.frequency.setValueAtTime(150, ctx.currentTime);
    mainGain.gain.setValueAtTime(0.12 * volumeMultiplier, ctx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.4);

    lfo.connect(lfoGain).connect(mainOsc.frequency);

    osc1.connect(gain1).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    mainOsc.connect(mainGain).connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    lfo.start(ctx.currentTime);
    mainOsc.start(ctx.currentTime);

    osc1.stop(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.28);
    lfo.stop(ctx.currentTime + 0.4);
    mainOsc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Camel Warning Sound: Dramatic descending horn when camel shadow appears
 */
const createCamelWarningSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Alarm horn
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.25 * volumeMultiplier, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35 * volumeMultiplier, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.5);

    // Low rumble
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.value = 60;
    rumbleGain.gain.setValueAtTime(0.15 * volumeMultiplier, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.6);

    osc.connect(gain).connect(ctx.destination);
    rumble.connect(rumbleGain).connect(ctx.destination);

    osc.start(ctx.currentTime);
    rumble.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    rumble.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Camel Impact Sound: Heavy crash/thud for game over moment
 */
const createCamelImpactSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Heavy impact thud
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impact.type = 'sine';
    impact.frequency.setValueAtTime(80, ctx.currentTime);
    impact.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
    impactGain.gain.setValueAtTime(0.4 * volumeMultiplier, ctx.currentTime);
    impactGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.4);

    // Crash noise
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3 * volumeMultiplier, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.4);

    impact.connect(impactGain).connect(ctx.destination);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);

    impact.start(ctx.currentTime);
    noise.start(ctx.currentTime);
    impact.stop(ctx.currentTime + 0.4);
    noise.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Orange Juggle Combo Sound: Escalating pitch and layers with streak count
 * @param streak - Consecutive hit count (can exceed 10, keeps escalating)
 */
const createOrangeJuggleComboSound = (streak: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Base frequency escalates continuously (capped at streak 50 for sanity)
    const streakCapped = Math.min(streak, 50);
    const baseFreq = 400 + streakCapped * 15; // Continuous escalation

    // Base hit - gets brighter with streak
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = streak >= 20 ? 'triangle' : 'sine'; // Brighter waveform at high streaks
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);

    // Add sparkle at streak 5+
    if (streak >= 5) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkle.type = 'sine';
      sparkle.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
      const sparkleIntensity = Math.min(0.12 + (streak - 5) * 0.01, 0.25); // Gets louder
      sparkleGain.gain.setValueAtTime(sparkleIntensity * volumeMultiplier, ctx.currentTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

      sparkle.connect(sparkleGain).connect(ctx.destination);
      sparkle.start(ctx.currentTime);
      sparkle.stop(ctx.currentTime + 0.2);
    }

    // Add bass hit at streak 8+
    if (streak >= 8) {
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sine';
      const bassFreq = 80 + Math.min(streak - 8, 20) * 2; // Bass rises slightly
      bass.frequency.setValueAtTime(bassFreq, ctx.currentTime);
      bassGain.gain.setValueAtTime(0.2 * volumeMultiplier, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.15);

      bass.connect(bassGain).connect(ctx.destination);
      bass.start(ctx.currentTime);
      bass.stop(ctx.currentTime + 0.15);
    }

    // Add shimmer at streak 10+ (continuous escalation)
    if (streak >= 10) {
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      const shimmerMult = 3 + Math.min(streak - 10, 15) * 0.1; // Gets higher
      shimmer.frequency.setValueAtTime(baseFreq * shimmerMult, ctx.currentTime);
      shimmer.frequency.linearRampToValueAtTime(baseFreq * (shimmerMult + 1), ctx.currentTime + 0.25);
      const shimmerIntensity = Math.min(0.08 + (streak - 10) * 0.005, 0.18);
      shimmerGain.gain.setValueAtTime(shimmerIntensity * volumeMultiplier, ctx.currentTime);
      shimmerGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.25);

      shimmer.connect(shimmerGain).connect(ctx.destination);
      shimmer.start(ctx.currentTime);
      shimmer.stop(ctx.currentTime + 0.25);
    }

    // Add celestial harmonic at streak 15+ (new layer!)
    if (streak >= 15) {
      const celestial = ctx.createOscillator();
      const celestialGain = ctx.createGain();
      celestial.type = 'sine';
      const celestialFreq = baseFreq * 4 + (streak - 15) * 10;
      celestial.frequency.setValueAtTime(celestialFreq, ctx.currentTime);
      celestial.frequency.exponentialRampToValueAtTime(celestialFreq * 1.5, ctx.currentTime + 0.15);
      const celestialIntensity = Math.min(0.06 + (streak - 15) * 0.003, 0.12);
      celestialGain.gain.setValueAtTime(celestialIntensity * volumeMultiplier, ctx.currentTime);
      celestialGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.18);

      celestial.connect(celestialGain).connect(ctx.destination);
      celestial.start(ctx.currentTime);
      celestial.stop(ctx.currentTime + 0.18);
    }

    // Add sub-bass rumble at streak 20+ (new layer!)
    if (streak >= 20) {
      const subBass = ctx.createOscillator();
      const subBassGain = ctx.createGain();
      subBass.type = 'sine';
      subBass.frequency.setValueAtTime(50, ctx.currentTime);
      subBass.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
      const subIntensity = Math.min(0.1 + (streak - 20) * 0.005, 0.2);
      subBassGain.gain.setValueAtTime(subIntensity * volumeMultiplier, ctx.currentTime);
      subBassGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

      subBass.connect(subBassGain).connect(ctx.destination);
      subBass.start(ctx.currentTime);
      subBass.stop(ctx.currentTime + 0.2);
    }

    // Add echo/delay effect at streak 25+ (epic territory!)
    if (streak >= 25) {
      const delay = ctx.createDelay();
      const echoGain = ctx.createGain();
      delay.delayTime.value = 0.08; // Quick slap-back echo

      const echo = ctx.createOscillator();
      echo.type = 'sine';
      echo.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      const echoIntensity = Math.min(0.08 + (streak - 25) * 0.003, 0.15);
      echoGain.gain.setValueAtTime(echoIntensity * volumeMultiplier, ctx.currentTime);
      echoGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.3);

      echo.connect(delay).connect(echoGain).connect(ctx.destination);
      echo.start(ctx.currentTime);
      echo.stop(ctx.currentTime + 0.3);
    }

    // Add crystalline overtones at streak 30+ (legendary!)
    if (streak >= 30) {
      const crystal1 = ctx.createOscillator();
      const crystal2 = ctx.createOscillator();
      const crystalGain = ctx.createGain();

      crystal1.type = 'sine';
      crystal2.type = 'sine';
      const crystalBase = baseFreq * 5;
      crystal1.frequency.setValueAtTime(crystalBase, ctx.currentTime);
      crystal2.frequency.setValueAtTime(crystalBase * 1.25, ctx.currentTime); // Perfect 4th harmony

      const crystalIntensity = Math.min(0.05 + (streak - 30) * 0.002, 0.1);
      crystalGain.gain.setValueAtTime(crystalIntensity * volumeMultiplier, ctx.currentTime);
      crystalGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

      crystal1.connect(crystalGain).connect(ctx.destination);
      crystal2.connect(crystalGain).connect(ctx.destination);
      crystal1.start(ctx.currentTime);
      crystal2.start(ctx.currentTime);
      crystal1.stop(ctx.currentTime + 0.2);
      crystal2.stop(ctx.currentTime + 0.2);
    }

    // Add godlike choir at streak 40+ (transcendent!)
    if (streak >= 40) {
      // Multiple detuned oscillators for choir effect
      const choirFreqs = [baseFreq * 2, baseFreq * 2.5, baseFreq * 3];
      const choirIntensity = Math.min(0.04 + (streak - 40) * 0.002, 0.08);

      choirFreqs.forEach((freq, i) => {
        const voice = ctx.createOscillator();
        const voiceGain = ctx.createGain();
        voice.type = 'sine';
        voice.frequency.setValueAtTime(freq + (i - 1) * 5, ctx.currentTime); // Slight detune
        voiceGain.gain.setValueAtTime(choirIntensity * volumeMultiplier, ctx.currentTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.25);

        voice.connect(voiceGain).connect(ctx.destination);
        voice.start(ctx.currentTime + i * 0.02); // Staggered start
        voice.stop(ctx.currentTime + 0.25);
      });
    }
  } catch (e) {
    // Silently fail
  }
};

/**
 * Orange Juggle Combo Break Sound: Deflating whoosh when combo expires
 */
const createOrangeJuggleComboBreakSound = (lostCombo: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (lostCombo < 3) return; // Only for meaningful combos

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Descending whoosh
    osc.type = 'triangle';
    const startFreq = 400 + Math.min(lostCombo, 10) * 20;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.35);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Silently fail
  }
};

// Rum ambient loop state
let rumAmbientOscillators: OscillatorNode[] = [];
let rumAmbientGains: GainNode[] = [];
let rumAmbientPlaying = false;

/**
 * Start Rum Ambient Loop: Woozy sloshing while rum effect active
 */
const startRumAmbientLoop = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx || rumAmbientPlaying) return;
    rumAmbientPlaying = true;

    // Woozy LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // Very slow wobble
    lfoGain.gain.value = 20;

    // Main woozy tone
    const main = ctx.createOscillator();
    const mainGain = ctx.createGain();
    main.type = 'triangle';
    main.frequency.value = 100;
    mainGain.gain.value = 0.08 * volumeMultiplier;

    lfo.connect(lfoGain).connect(main.frequency);
    main.connect(mainGain).connect(ctx.destination);

    lfo.start(ctx.currentTime);
    main.start(ctx.currentTime);

    rumAmbientOscillators = [lfo, main];
    rumAmbientGains = [lfoGain, mainGain];
  } catch (e) {
    // Silently fail
  }
};

/**
 * Stop Rum Ambient Loop
 */
const stopRumAmbientLoop = () => {
  if (!rumAmbientPlaying) return;
  rumAmbientPlaying = false;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      rumAmbientGains.forEach(g => {
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      });
    }

    setTimeout(() => {
      rumAmbientOscillators.forEach(o => {
        try { o.stop(); } catch (e) { /* already stopped */ }
      });
      rumAmbientOscillators = [];
      rumAmbientGains = [];
    }, 500);
  } catch (e) {
    // Silently fail
  }
};

// Banana ambient loop state
let bananaAmbientOscillators: OscillatorNode[] = [];
let bananaAmbientGains: GainNode[] = [];
let bananaAmbientPlaying = false;

/**
 * Start Banana Ambient Loop: Energetic shimmer during multiplier
 */
const startBananaAmbientLoop = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx || bananaAmbientPlaying) return;
    bananaAmbientPlaying = true;

    // Fast shimmer LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 8; // Faster, energetic
    lfoGain.gain.value = 15;

    // Bright sparkle tone
    const main = ctx.createOscillator();
    const mainGain = ctx.createGain();
    main.type = 'sine';
    main.frequency.value = 800;
    mainGain.gain.value = 0.05 * volumeMultiplier;

    // Second harmonic
    const harm = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harm.type = 'sine';
    harm.frequency.value = 1200;
    harmGain.gain.value = 0.03 * volumeMultiplier;

    lfo.connect(lfoGain).connect(main.frequency);
    main.connect(mainGain).connect(ctx.destination);
    harm.connect(harmGain).connect(ctx.destination);

    lfo.start(ctx.currentTime);
    main.start(ctx.currentTime);
    harm.start(ctx.currentTime);

    bananaAmbientOscillators = [lfo, main, harm];
    bananaAmbientGains = [lfoGain, mainGain, harmGain];
  } catch (e) {
    // Silently fail
  }
};

/**
 * Stop Banana Ambient Loop
 */
const stopBananaAmbientLoop = () => {
  if (!bananaAmbientPlaying) return;
  bananaAmbientPlaying = false;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      bananaAmbientGains.forEach(g => {
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      });
    }

    setTimeout(() => {
      bananaAmbientOscillators.forEach(o => {
        try { o.stop(); } catch (e) { /* already stopped */ }
      });
      bananaAmbientOscillators = [];
      bananaAmbientGains = [];
    }, 300);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Orange Juggle Level Complete Sound: Triumphant fanfare
 */
const createOrangeJuggleLevelCompleteSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6

    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.35 * volumeMultiplier, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + i * 0.12 + 0.3);

      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) {
    // Silently fail
  }
};

/**
 * Arm Swing Whoosh: Subtle whoosh when orangutan swings arm
 */
const createArmSwingSound = (isLeftArm: boolean = true) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = isLeftArm ? 800 : 900; // Slight variation
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.08);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Silently fail
  }
};

// ============================================
// HOOK
// ============================================

export function useGameSounds() {
  const { isSoundEffectsEnabled } = useAudio();
  const { settings } = useSettings();
  const lastWinSoundRef = useRef(-1);

  // Get sound effects volume from settings
  const effectiveVolume = settings.audio.soundEffectsVolume;

  // Update the global volume multiplier when settings change
  useEffect(() => {
    volumeMultiplier = effectiveVolume;
  }, [effectiveVolume]);

  // Initialize audio context and SoundManager on first user interaction
  useEffect(() => {
    const initAudio = () => {
      getAudioContext();
      // Also initialize the MP3-based SoundManager
      if (!SoundManager.getIsInitialized()) {
        SoundManager.initialize();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Play a win/high-score sound - uses MP3 with synthesized fallback
  const playWinSound = useCallback(() => {
    if (!isSoundEffectsEnabled) return;

    // Try MP3 first
    SoundManager.play('high-score');

    // Also play synthesized sound for extra richness
    let index = Math.floor(Math.random() * WIN_SOUNDS.length);
    if (index === lastWinSoundRef.current && WIN_SOUNDS.length > 1) {
      index = (index + 1) % WIN_SOUNDS.length;
    }
    lastWinSoundRef.current = index;
    WIN_SOUNDS[index]();
  }, [isSoundEffectsEnabled]);

  // Brick by Brick sounds
  const playBlockLand = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    // Use MP3 score sound for landing
    SoundManager.play('score');
    // Also play synthesized for extra feedback
    createBlockLandSound();
  }, [isSoundEffectsEnabled]);

  const playPerfectBonus = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    // Perfect drops use success sound
    SoundManager.play('success');
    createPerfectBonusSound();
  }, [isSoundEffectsEnabled]);

  const playCombo = useCallback((level: number) => {
    if (!isSoundEffectsEnabled) return;
    // Use escalating MP3 combo sounds
    const comboSound = getComboSound(level);
    SoundManager.play(comboSound);
    // Also play synthesized for layered effect
    createComboSound(level);
  }, [isSoundEffectsEnabled]);

  // Orange Pong sounds
  const playPaddleHit = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('score');
    createPaddleHitSound();
  }, [isSoundEffectsEnabled]);

  const playWallBounce = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createWallBounceSound();
  }, [isSoundEffectsEnabled]);

  const playScorePoint = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('score');
    createScorePointSound();
  }, [isSoundEffectsEnabled]);

  // Wojak Runner sounds
  const playCollect = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('currency-earn');
    createCollectSound();
  }, [isSoundEffectsEnabled]);

  const playWhoosh = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createWhooshSound();
  }, [isSoundEffectsEnabled]);

  const playSpeedUp = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('level-up');
    createSpeedUpSound();
  }, [isSoundEffectsEnabled]);

  // Memory Match sounds
  const playCardHover = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createCardHoverSound();
  }, [isSoundEffectsEnabled]);

  const playCardFlip = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('button-click');
    createCardFlipSound();
  }, [isSoundEffectsEnabled]);

  const playMatchFound = useCallback((streak: number = 1) => {
    if (!isSoundEffectsEnabled) return;
    // Use different MP3 sounds based on streak level
    if (streak >= 3) {
      SoundManager.play('achievement'); // More celebratory for max streak
    } else {
      SoundManager.play('success');
    }
    createMatchFoundSound(streak);
  }, [isSoundEffectsEnabled]);

  const playMismatch = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('error');
    createMismatchSound();
  }, [isSoundEffectsEnabled]);

  // Near-completion anticipation sound
  const playNearCompletion = useCallback((pairsRemaining: number) => {
    if (!isSoundEffectsEnabled) return;
    createAnticipationSound(pairsRemaining);
  }, [isSoundEffectsEnabled]);

  // Fast match bonus sound (layers on top of normal match)
  const playFastMatchBonus = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createFastMatchBonus();
  }, [isSoundEffectsEnabled]);

  // Game over sound
  const playGameOver = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('game-over');
    createGameOverSound();
  }, [isSoundEffectsEnabled]);

  // Running footstep loop for continuous movement sound
  const startRunning = useCallback((bpm: number = 180) => {
    if (isSoundEffectsEnabled) startRunningLoop(bpm);
  }, [isSoundEffectsEnabled]);

  const stopRunning = useCallback(() => {
    stopRunningLoop();
  }, []);

  // Cleanup running loop on unmount
  useEffect(() => {
    return () => {
      stopRunningLoop();
    };
  }, []);

  // New MP3-based sounds
  const playGameStart = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('game-start');
  }, [isSoundEffectsEnabled]);

  const playCountdown = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('countdown');
  }, [isSoundEffectsEnabled]);

  const playCountdownGo = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('countdown-go');
  }, [isSoundEffectsEnabled]);

  const playWarning = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('warning');
  }, [isSoundEffectsEnabled]);

  const playAchievement = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('achievement');
  }, [isSoundEffectsEnabled]);

  const playLevelUp = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('level-up');
  }, [isSoundEffectsEnabled]);

  const playButtonClick = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('button-click');
  }, [isSoundEffectsEnabled]);

  // Brick Breaker sounds
  const playBallLaunch = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBallLaunchSound();
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerPaddleHit = useCallback((hitPosition: number = 0.5) => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerPaddleHitSound(hitPosition);
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerWallHit = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerWallHitSound();
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerBrickDestroy = useCallback((brickType: 'normal' | 'strong' = 'normal') => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerBrickDestroySound(brickType);
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerBrickCrack = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerBrickCrackSound();
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerUnbreakableHit = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerUnbreakableHitSound();
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerPowerupSpawn = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerPowerupSpawnSound();
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerPowerupCollect = useCallback((type: string) => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerPowerupCollectSound(type);
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerBallLost = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerBallLostSound();
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerCombo = useCallback((combo: number) => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerComboSound(combo);
  }, [isSoundEffectsEnabled]);

  const playBrickBreakerComboBreak = useCallback((lostCombo: number) => {
    if (!isSoundEffectsEnabled) return;
    createBrickBreakerComboBreakSound(lostCombo);
  }, [isSoundEffectsEnabled]);

  const startBrickBreakerAnticipationLoop = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    startBrickBreakerAnticipation();
  }, [isSoundEffectsEnabled]);

  const stopBrickBreakerAnticipationLoop = useCallback(() => {
    stopBrickBreakerAnticipation();
  }, []);

  const startBrickBreakerFireballLoop = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    startBrickBreakerFireball();
  }, [isSoundEffectsEnabled]);

  const stopBrickBreakerFireballLoop = useCallback(() => {
    stopBrickBreakerFireball();
  }, []);

  // Orange Juggle sounds
  const playOrangeJuggleHit = useCallback((hitPosition: number = 0.5) => {
    if (!isSoundEffectsEnabled) return;
    createOrangeJuggleHitSound(hitPosition);
  }, [isSoundEffectsEnabled]);

  const playOrangeDrop = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createOrangeDropSound();
  }, [isSoundEffectsEnabled]);

  const playGoldenOrangeHit = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createGoldenOrangeHitSound();
  }, [isSoundEffectsEnabled]);

  const playBananaCollect = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createBananaCollectSound();
  }, [isSoundEffectsEnabled]);

  const playRumCollect = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createRumCollectSound();
  }, [isSoundEffectsEnabled]);

  const playCamelWarning = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createCamelWarningSound();
  }, [isSoundEffectsEnabled]);

  const playCamelImpact = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createCamelImpactSound();
  }, [isSoundEffectsEnabled]);

  const playOrangeJuggleCombo = useCallback((comboCount: number) => {
    if (!isSoundEffectsEnabled) return;
    createOrangeJuggleComboSound(comboCount);
  }, [isSoundEffectsEnabled]);

  const playOrangeJuggleComboBreak = useCallback((lostCombo: number) => {
    if (!isSoundEffectsEnabled) return;
    createOrangeJuggleComboBreakSound(lostCombo);
  }, [isSoundEffectsEnabled]);

  const startRumAmbient = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    startRumAmbientLoop();
  }, [isSoundEffectsEnabled]);

  const stopRumAmbient = useCallback(() => {
    stopRumAmbientLoop();
  }, []);

  const startBananaAmbient = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    startBananaAmbientLoop();
  }, [isSoundEffectsEnabled]);

  const stopBananaAmbient = useCallback(() => {
    stopBananaAmbientLoop();
  }, []);

  const playOrangeJuggleLevelComplete = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    createOrangeJuggleLevelCompleteSound();
  }, [isSoundEffectsEnabled]);

  const playArmSwing = useCallback((isLeftArm: boolean = true) => {
    if (!isSoundEffectsEnabled) return;
    createArmSwingSound(isLeftArm);
  }, [isSoundEffectsEnabled]);

  // Cleanup Orange Juggle ambient loops on unmount
  useEffect(() => {
    return () => {
      stopRumAmbientLoop();
      stopBananaAmbientLoop();
    };
  }, []);

  return {
    // Win/level complete
    playWinSound,

    // Brick by Brick
    playBlockLand,
    playPerfectBonus,
    playCombo,

    // Orange Pong
    playPaddleHit,
    playWallBounce,
    playScorePoint,

    // Wojak Runner
    playCollect,
    playWhoosh,
    playSpeedUp,
    startRunning,
    stopRunning,

    // Memory Match
    playCardHover,
    playCardFlip,
    playMatchFound,
    playMismatch,
    playNearCompletion,
    playFastMatchBonus,

    // Game over
    playGameOver,

    // New MP3-based sounds
    playGameStart,
    playCountdown,
    playCountdownGo,
    playWarning,
    playAchievement,
    playLevelUp,
    playButtonClick,

    // Brick Breaker
    playBallLaunch,
    playBrickBreakerPaddleHit,
    playBrickBreakerWallHit,
    playBrickBreakerBrickDestroy,
    playBrickBreakerBrickCrack,
    playBrickBreakerUnbreakableHit,
    playBrickBreakerPowerupSpawn,
    playBrickBreakerPowerupCollect,
    playBrickBreakerBallLost,
    playBrickBreakerCombo,
    playBrickBreakerComboBreak,
    startBrickBreakerAnticipationLoop,
    stopBrickBreakerAnticipationLoop,
    startBrickBreakerFireballLoop,
    stopBrickBreakerFireballLoop,

    // Orange Juggle
    playOrangeJuggleHit,
    playOrangeDrop,
    playGoldenOrangeHit,
    playBananaCollect,
    playRumCollect,
    playCamelWarning,
    playCamelImpact,
    playOrangeJuggleCombo,
    playOrangeJuggleComboBreak,
    startRumAmbient,
    stopRumAmbient,
    startBananaAmbient,
    stopBananaAmbient,
    playOrangeJuggleLevelComplete,
    playArmSwing,
  };
}

export default useGameSounds;
