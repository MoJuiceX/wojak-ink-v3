/**
 * Game Sounds Hook
 *
 * Provides synthesized sound effects for all games using Web Audio API.
 * No external audio files needed - all sounds are generated programmatically.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useSettings } from '@/contexts/SettingsContext';

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
// WIN/LEVEL COMPLETE SOUNDS (5 variations)
// ============================================

const createBellChimeSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.15 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.5);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
};

const createAscendingXylophoneSound = () => {
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
    gain.gain.linearRampToValueAtTime(0.12 * volumeMultiplier, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.25);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  });
};

const createHarpGlissandoSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [392, 440, 494, 523, 587, 659, 698, 784]; // G4 to G5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.04;
    gain.gain.setValueAtTime(0.08 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.3);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
};

const createMarimbaFlourishSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [262, 330, 392, 523]; // C4, E4, G4, C5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc2.frequency.setValueAtTime(freq * 4, ctx.currentTime); // Overtone
    osc.type = 'sine';
    osc2.type = 'sine';

    const startTime = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.4);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + 0.4);
    osc2.stop(startTime + 0.4);
  });
};

const createSparkleSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  for (let i = 0; i < 5; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const freq = 1500 + Math.random() * 2000;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.06;
    gain.gain.setValueAtTime(0.08 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.15);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
};

const WIN_SOUNDS = [
  createBellChimeSound,
  createAscendingXylophoneSound,
  createHarpGlissandoSound,
  createMarimbaFlourishSound,
  createSparkleSound,
];

// ============================================
// GAME ACTION SOUNDS
// ============================================

// Orange Stack sounds
const createBlockLandSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
  osc.type = 'triangle';

  gain.gain.setValueAtTime(0.15 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
};

const createPerfectBonusSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [880, 1100, 1320];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.05;
    gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.15);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
};

const createComboSound = (comboLevel: number) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = 400 + comboLevel * 50;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.12);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
};

// Orange Pong sounds
const createPaddleHitSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);
  osc.type = 'square';

  gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.08);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
};

const createWallBounceSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
  osc.type = 'triangle';

  gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.06);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
};

const createScorePointSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.12 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.15);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
};

// Wojak Runner sounds
const createCollectSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.1 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
};

const createWhooshSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // White noise for whoosh
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.Q.setValueAtTime(0.5, ctx.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.1);

  source.start(ctx.currentTime);
};

const createSpeedUpSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
  osc.type = 'sawtooth';

  gain.gain.setValueAtTime(0.05 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
};

// Memory Match sounds
const createCardFlipSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Short noise burst for flip
  const bufferSize = ctx.sampleRate * 0.03;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.06 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.03);

  source.start(ctx.currentTime);
};

const createMatchFoundSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523, 659]; // C5, E5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.2);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
};

const createMismatchSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.08 * volumeMultiplier, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, ctx.currentTime + 0.15);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
};

// Game over sound (sad)
const createGameOverSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [400, 350, 300, 250];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.1 * volumeMultiplier, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * volumeMultiplier, startTime + 0.3);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
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

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      getAudioContext();
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

  // Play a random win sound (different from last one)
  const playWinSound = useCallback(() => {
    if (!isSoundEffectsEnabled) return;

    let index = Math.floor(Math.random() * WIN_SOUNDS.length);
    // Ensure different from last time
    if (index === lastWinSoundRef.current && WIN_SOUNDS.length > 1) {
      index = (index + 1) % WIN_SOUNDS.length;
    }
    lastWinSoundRef.current = index;
    WIN_SOUNDS[index]();
  }, [isSoundEffectsEnabled]);

  // Orange Stack sounds
  const playBlockLand = useCallback(() => {
    if (isSoundEffectsEnabled) createBlockLandSound();
  }, [isSoundEffectsEnabled]);

  const playPerfectBonus = useCallback(() => {
    if (isSoundEffectsEnabled) createPerfectBonusSound();
  }, [isSoundEffectsEnabled]);

  const playCombo = useCallback((level: number) => {
    if (isSoundEffectsEnabled) createComboSound(level);
  }, [isSoundEffectsEnabled]);

  // Orange Pong sounds
  const playPaddleHit = useCallback(() => {
    if (isSoundEffectsEnabled) createPaddleHitSound();
  }, [isSoundEffectsEnabled]);

  const playWallBounce = useCallback(() => {
    if (isSoundEffectsEnabled) createWallBounceSound();
  }, [isSoundEffectsEnabled]);

  const playScorePoint = useCallback(() => {
    if (isSoundEffectsEnabled) createScorePointSound();
  }, [isSoundEffectsEnabled]);

  // Wojak Runner sounds
  const playCollect = useCallback(() => {
    if (isSoundEffectsEnabled) createCollectSound();
  }, [isSoundEffectsEnabled]);

  const playWhoosh = useCallback(() => {
    if (isSoundEffectsEnabled) createWhooshSound();
  }, [isSoundEffectsEnabled]);

  const playSpeedUp = useCallback(() => {
    if (isSoundEffectsEnabled) createSpeedUpSound();
  }, [isSoundEffectsEnabled]);

  // Memory Match sounds
  const playCardFlip = useCallback(() => {
    if (isSoundEffectsEnabled) createCardFlipSound();
  }, [isSoundEffectsEnabled]);

  const playMatchFound = useCallback(() => {
    if (isSoundEffectsEnabled) createMatchFoundSound();
  }, [isSoundEffectsEnabled]);

  const playMismatch = useCallback(() => {
    if (isSoundEffectsEnabled) createMismatchSound();
  }, [isSoundEffectsEnabled]);

  // Game over sound
  const playGameOver = useCallback(() => {
    if (isSoundEffectsEnabled) createGameOverSound();
  }, [isSoundEffectsEnabled]);

  return {
    // Win/level complete
    playWinSound,

    // Orange Stack
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

    // Memory Match
    playCardFlip,
    playMatchFound,
    playMismatch,

    // Game over
    playGameOver,
  };
}

export default useGameSounds;
