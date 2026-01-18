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
 * Card Flip: Soft "tik" - like gentle tap on glass
 * 20-30ms, subtle, not intrusive
 */
const createCardFlipSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Soft click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.025);
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
 * Match Found: Bubbly two-note rising chime
 * Bright, crystalline, 200ms total
 */
const createMatchFoundSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Rising two-note chime (C5 → E5)
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

    // Light sparkle
    createSparkleCascade(ctx, 2, 1400);
  } catch (e) {
    // Silently fail - don't break game flow
  }
};

/**
 * Mismatch: Soft "bonk" - almost cute
 * Low thud (150Hz), quick, NO harsh buzz
 * NOT punishing - light-hearted
 */
const createMismatchSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Soft low bonk
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
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
  const playCardFlip = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('button-click');
    createCardFlipSound();
  }, [isSoundEffectsEnabled]);

  const playMatchFound = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('success');
    createMatchFoundSound();
  }, [isSoundEffectsEnabled]);

  const playMismatch = useCallback(() => {
    if (!isSoundEffectsEnabled) return;
    SoundManager.play('error');
    createMismatchSound();
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
    playCardFlip,
    playMatchFound,
    playMismatch,

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
  };
}

export default useGameSounds;
