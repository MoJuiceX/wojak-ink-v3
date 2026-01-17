# ENHANCEMENT PROMPT 01: Sound Effects System

## Priority: HIGH 🔥
Sound effects dramatically improve game feel and player satisfaction. They create dopamine hits on every score, making players want to keep playing.

---

## Overview

Create a centralized sound effects system that:
1. Plays sounds for game events (score, combo, game over, etc.)
2. Supports volume control and mute toggle
3. Uses Web Audio API for low latency
4. Is integrated into the shared systems architecture
5. Automatically triggers from `useGameSession` hook

---

## Architecture

```
src/systems/audio/
├── index.ts                 # Export everything
├── SoundManager.ts          # Core sound manager class
├── AudioContext.tsx         # React context for audio state
├── useGameSounds.ts         # Hook for game sound integration
├── sounds.ts                # Sound definitions and URLs
└── assets/                  # Sound files (or use URLs)
    ├── score.mp3
    ├── combo-1.mp3
    ├── combo-5.mp3
    ├── combo-10.mp3
    ├── high-score.mp3
    ├── game-over.mp3
    ├── button-click.mp3
    ├── countdown.mp3
    └── achievement.mp3
```

---

## Part 1: Sound Definitions

Create `src/systems/audio/sounds.ts`:

```typescript
export type SoundName =
  | 'score'           // Points earned
  | 'combo-1'         // Combo level 1-2
  | 'combo-2'         // Combo level 3-4
  | 'combo-3'         // Combo level 5-6
  | 'combo-4'         // Combo level 7-8
  | 'combo-5'         // Combo level 9-10
  | 'combo-max'       // Combo 10+ (epic)
  | 'high-score'      // New high score achieved
  | 'game-over'       // Game ended
  | 'game-start'      // Game begins
  | 'countdown'       // 3-2-1 countdown beep
  | 'countdown-go'    // GO! sound
  | 'button-click'    // UI button press
  | 'button-hover'    // UI button hover (optional)
  | 'achievement'     // Achievement unlocked
  | 'currency-earn'   // Oranges/gems earned
  | 'level-up'        // Level increased
  | 'warning'         // Low time, low lives warning
  | 'success'         // Generic success
  | 'error';          // Generic error/fail

export interface SoundDefinition {
  name: SoundName;
  url: string;
  volume: number;      // 0-1, default volume
  maxInstances: number; // How many can play simultaneously
  category: 'sfx' | 'music' | 'ui';
}

// Base URL for sound assets (adjust to your setup)
const SOUNDS_BASE_URL = '/assets/sounds';

export const SOUND_DEFINITIONS: SoundDefinition[] = [
  // Gameplay sounds
  {
    name: 'score',
    url: `${SOUNDS_BASE_URL}/score.mp3`,
    volume: 0.5,
    maxInstances: 5, // Can overlap for rapid scoring
    category: 'sfx'
  },
  {
    name: 'combo-1',
    url: `${SOUNDS_BASE_URL}/combo-1.mp3`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-2',
    url: `${SOUNDS_BASE_URL}/combo-2.mp3`,
    volume: 0.65,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-3',
    url: `${SOUNDS_BASE_URL}/combo-3.mp3`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-4',
    url: `${SOUNDS_BASE_URL}/combo-4.mp3`,
    volume: 0.75,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-5',
    url: `${SOUNDS_BASE_URL}/combo-5.mp3`,
    volume: 0.8,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-max',
    url: `${SOUNDS_BASE_URL}/combo-max.mp3`,
    volume: 0.85,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'high-score',
    url: `${SOUNDS_BASE_URL}/high-score.mp3`,
    volume: 0.8,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'game-over',
    url: `${SOUNDS_BASE_URL}/game-over.mp3`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'game-start',
    url: `${SOUNDS_BASE_URL}/game-start.mp3`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'countdown',
    url: `${SOUNDS_BASE_URL}/countdown.mp3`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'countdown-go',
    url: `${SOUNDS_BASE_URL}/countdown-go.mp3`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },

  // UI sounds
  {
    name: 'button-click',
    url: `${SOUNDS_BASE_URL}/button-click.mp3`,
    volume: 0.4,
    maxInstances: 3,
    category: 'ui'
  },
  {
    name: 'button-hover',
    url: `${SOUNDS_BASE_URL}/button-hover.mp3`,
    volume: 0.2,
    maxInstances: 2,
    category: 'ui'
  },

  // Reward sounds
  {
    name: 'achievement',
    url: `${SOUNDS_BASE_URL}/achievement.mp3`,
    volume: 0.75,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'currency-earn',
    url: `${SOUNDS_BASE_URL}/currency-earn.mp3`,
    volume: 0.5,
    maxInstances: 3,
    category: 'sfx'
  },
  {
    name: 'level-up',
    url: `${SOUNDS_BASE_URL}/level-up.mp3`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },

  // Feedback sounds
  {
    name: 'warning',
    url: `${SOUNDS_BASE_URL}/warning.mp3`,
    volume: 0.5,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'success',
    url: `${SOUNDS_BASE_URL}/success.mp3`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'error',
    url: `${SOUNDS_BASE_URL}/error.mp3`,
    volume: 0.5,
    maxInstances: 1,
    category: 'sfx'
  }
];

// Helper to get combo sound based on level
export const getComboSound = (comboLevel: number): SoundName => {
  if (comboLevel >= 10) return 'combo-max';
  if (comboLevel >= 8) return 'combo-5';
  if (comboLevel >= 6) return 'combo-4';
  if (comboLevel >= 4) return 'combo-3';
  if (comboLevel >= 2) return 'combo-2';
  return 'combo-1';
};
```

---

## Part 2: Sound Manager Class

Create `src/systems/audio/SoundManager.ts`:

```typescript
import { SoundName, SoundDefinition, SOUND_DEFINITIONS } from './sounds';

interface SoundInstance {
  audio: HTMLAudioElement;
  isPlaying: boolean;
}

interface SoundPool {
  definition: SoundDefinition;
  instances: SoundInstance[];
  currentIndex: number;
}

class SoundManagerClass {
  private pools: Map<SoundName, SoundPool> = new Map();
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 1;
  private sfxVolume: number = 1;
  private uiVolume: number = 1;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private pendingSounds: SoundName[] = [];

  constructor() {
    // Check for saved preferences
    this.loadPreferences();
  }

  /**
   * Initialize the audio system
   * MUST be called after user interaction (click/tap) due to browser policies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Preload all sounds
      await this.preloadSounds();

      this.isInitialized = true;
      console.log('🔊 Sound system initialized');

      // Play any sounds that were requested before initialization
      this.pendingSounds.forEach(sound => this.play(sound));
      this.pendingSounds = [];

    } catch (error) {
      console.error('Failed to initialize sound system:', error);
    }
  }

  /**
   * Preload all sound files
   */
  private async preloadSounds(): Promise<void> {
    const loadPromises = SOUND_DEFINITIONS.map(async (definition) => {
      const instances: SoundInstance[] = [];

      // Create pool of audio elements for each sound
      for (let i = 0; i < definition.maxInstances; i++) {
        const audio = new Audio(definition.url);
        audio.preload = 'auto';
        audio.volume = definition.volume * this.getVolumeForCategory(definition.category);

        // Wait for the audio to be loaded
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${definition.name}`);
            resolve(); // Don't reject, just warn
          }, { once: true });
        });

        instances.push({ audio, isPlaying: false });
      }

      this.pools.set(definition.name, {
        definition,
        instances,
        currentIndex: 0
      });
    });

    await Promise.all(loadPromises);
  }

  /**
   * Get volume multiplier for a category
   */
  private getVolumeForCategory(category: 'sfx' | 'music' | 'ui'): number {
    if (this.isMuted) return 0;

    switch (category) {
      case 'sfx':
        return this.masterVolume * this.sfxVolume;
      case 'ui':
        return this.masterVolume * this.uiVolume;
      case 'music':
        return this.masterVolume;
      default:
        return this.masterVolume;
    }
  }

  /**
   * Play a sound
   */
  play(name: SoundName, volumeMultiplier: number = 1): void {
    // If not initialized, queue the sound
    if (!this.isInitialized) {
      this.pendingSounds.push(name);
      return;
    }

    if (this.isMuted) return;

    const pool = this.pools.get(name);
    if (!pool) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    // Find an available instance or use the next in rotation
    const instance = pool.instances[pool.currentIndex];

    // Reset and play
    instance.audio.currentTime = 0;
    instance.audio.volume = pool.definition.volume *
      this.getVolumeForCategory(pool.definition.category) *
      volumeMultiplier;

    instance.audio.play().catch(error => {
      // Autoplay was prevented - this is normal on first interaction
      console.debug(`Sound play prevented: ${name}`, error);
    });

    // Rotate to next instance
    pool.currentIndex = (pool.currentIndex + 1) % pool.instances.length;
  }

  /**
   * Play a sound with pitch variation (for variety)
   */
  playWithPitch(name: SoundName, pitchVariation: number = 0): void {
    // Note: Pitch variation requires Web Audio API nodes
    // For simplicity, we'll just play the sound
    // Advanced implementation would use AudioBufferSourceNode
    this.play(name);
  }

  /**
   * Stop a specific sound
   */
  stop(name: SoundName): void {
    const pool = this.pools.get(name);
    if (!pool) return;

    pool.instances.forEach(instance => {
      instance.audio.pause();
      instance.audio.currentTime = 0;
    });
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.pools.forEach(pool => {
      pool.instances.forEach(instance => {
        instance.audio.pause();
        instance.audio.currentTime = 0;
      });
    });
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.savePreferences();
  }

  /**
   * Set SFX volume (0-1)
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.savePreferences();
  }

  /**
   * Set UI volume (0-1)
   */
  setUiVolume(volume: number): void {
    this.uiVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.savePreferences();
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.updateAllVolumes();
    this.savePreferences();
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateAllVolumes();
    this.savePreferences();
  }

  /**
   * Get current mute state
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get current volumes
   */
  getVolumes(): { master: number; sfx: number; ui: number; muted: boolean } {
    return {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      ui: this.uiVolume,
      muted: this.isMuted
    };
  }

  /**
   * Update volumes on all audio elements
   */
  private updateAllVolumes(): void {
    this.pools.forEach(pool => {
      const volume = pool.definition.volume * this.getVolumeForCategory(pool.definition.category);
      pool.instances.forEach(instance => {
        instance.audio.volume = volume;
      });
    });
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    const prefs = {
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      uiVolume: this.uiVolume,
      isMuted: this.isMuted
    };
    localStorage.setItem('wojak-sound-prefs', JSON.stringify(prefs));
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('wojak-sound-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.masterVolume = prefs.masterVolume ?? 1;
        this.sfxVolume = prefs.sfxVolume ?? 1;
        this.uiVolume = prefs.uiVolume ?? 1;
        this.isMuted = prefs.isMuted ?? false;
      }
    } catch (e) {
      // Use defaults
    }
  }
}

// Singleton instance
export const SoundManager = new SoundManagerClass();
```

---

## Part 3: React Audio Context

Create `src/systems/audio/AudioContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SoundManager } from './SoundManager';
import { SoundName, getComboSound } from './sounds';

interface AudioContextType {
  // State
  isInitialized: boolean;
  isMuted: boolean;
  masterVolume: number;
  sfxVolume: number;

  // Actions
  initialize: () => Promise<void>;
  play: (name: SoundName) => void;
  playCombo: (level: number) => void;
  toggleMute: () => void;
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(SoundManager.getMuted());
  const [masterVolume, setMasterVolumeState] = useState(SoundManager.getVolumes().master);
  const [sfxVolume, setSfxVolumeState] = useState(SoundManager.getVolumes().sfx);

  // Initialize on first user interaction
  const initialize = useCallback(async () => {
    if (!isInitialized) {
      await SoundManager.initialize();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Auto-initialize on first click/tap anywhere
  useEffect(() => {
    const handleInteraction = () => {
      initialize();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [initialize]);

  // Play a sound
  const play = useCallback((name: SoundName) => {
    SoundManager.play(name);
  }, []);

  // Play combo sound based on level
  const playCombo = useCallback((level: number) => {
    const soundName = getComboSound(level);
    SoundManager.play(soundName);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = SoundManager.toggleMute();
    setIsMuted(newMuted);
  }, []);

  // Set master volume
  const setMasterVolume = useCallback((volume: number) => {
    SoundManager.setMasterVolume(volume);
    setMasterVolumeState(volume);
  }, []);

  // Set SFX volume
  const setSfxVolume = useCallback((volume: number) => {
    SoundManager.setSfxVolume(volume);
    setSfxVolumeState(volume);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isInitialized,
        isMuted,
        masterVolume,
        sfxVolume,
        initialize,
        play,
        playCombo,
        toggleMute,
        setMasterVolume,
        setSfxVolume
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
```

---

## Part 4: Game Sounds Hook

Create `src/systems/audio/useGameSounds.ts`:

```typescript
import { useCallback } from 'react';
import { useAudio } from './AudioContext';
import { SoundName } from './sounds';

/**
 * Hook for game-specific sound triggers
 * Use this in games instead of useAudio directly
 */
export const useGameSounds = () => {
  const { play, playCombo } = useAudio();

  // Score earned
  const playScore = useCallback((points?: number) => {
    // Could vary sound based on points in future
    play('score');
  }, [play]);

  // Combo achieved
  const playComboSound = useCallback((level: number) => {
    playCombo(level);
  }, [playCombo]);

  // New high score
  const playHighScore = useCallback(() => {
    play('high-score');
  }, [play]);

  // Game over
  const playGameOver = useCallback(() => {
    play('game-over');
  }, [play]);

  // Game start
  const playGameStart = useCallback(() => {
    play('game-start');
  }, [play]);

  // Countdown (3, 2, 1)
  const playCountdown = useCallback(() => {
    play('countdown');
  }, [play]);

  // Countdown GO!
  const playCountdownGo = useCallback(() => {
    play('countdown-go');
  }, [play]);

  // Achievement unlocked
  const playAchievement = useCallback(() => {
    play('achievement');
  }, [play]);

  // Currency earned (oranges/gems)
  const playCurrencyEarn = useCallback(() => {
    play('currency-earn');
  }, [play]);

  // Level up
  const playLevelUp = useCallback(() => {
    play('level-up');
  }, [play]);

  // Warning (low time, etc.)
  const playWarning = useCallback(() => {
    play('warning');
  }, [play]);

  // Button click (for UI)
  const playButtonClick = useCallback(() => {
    play('button-click');
  }, [play]);

  // Generic success
  const playSuccess = useCallback(() => {
    play('success');
  }, [play]);

  // Generic error
  const playError = useCallback(() => {
    play('error');
  }, [play]);

  return {
    playScore,
    playComboSound,
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
    // Also expose raw play for custom sounds
    play
  };
};
```

---

## Part 5: Sound Settings UI Component

Create `src/systems/audio/SoundSettings.tsx`:

```typescript
import React from 'react';
import { IonRange, IonToggle, IonIcon } from '@ionic/react';
import { volumeHigh, volumeMute, volumeLow } from 'ionicons/icons';
import { useAudio } from './AudioContext';
import './audio.css';

export const SoundSettings: React.FC = () => {
  const {
    isMuted,
    masterVolume,
    sfxVolume,
    toggleMute,
    setMasterVolume,
    setSfxVolume
  } = useAudio();

  return (
    <div className="sound-settings">
      <div className="setting-row">
        <div className="setting-label">
          <IonIcon icon={isMuted ? volumeMute : volumeHigh} />
          <span>Sound</span>
        </div>
        <IonToggle
          checked={!isMuted}
          onIonChange={toggleMute}
        />
      </div>

      {!isMuted && (
        <>
          <div className="setting-row">
            <div className="setting-label">
              <IonIcon icon={volumeLow} />
              <span>Master Volume</span>
            </div>
            <IonRange
              min={0}
              max={100}
              value={masterVolume * 100}
              onIonChange={(e) => setMasterVolume(e.detail.value as number / 100)}
            />
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <IonIcon icon={volumeLow} />
              <span>Sound Effects</span>
            </div>
            <IonRange
              min={0}
              max={100}
              value={sfxVolume * 100}
              onIonChange={(e) => setSfxVolume(e.detail.value as number / 100)}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Quick mute button for game UI
export const MuteButton: React.FC<{ className?: string }> = ({ className }) => {
  const { isMuted, toggleMute, playButtonClick } = useAudio();

  const handleClick = () => {
    playButtonClick();
    toggleMute();
  };

  return (
    <button
      className={`mute-button ${className || ''}`}
      onClick={handleClick}
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      <IonIcon icon={isMuted ? volumeMute : volumeHigh} />
    </button>
  );
};
```

---

## Part 6: CSS for Audio UI

Create `src/systems/audio/audio.css`:

```css
/* Sound Settings */
.sound-settings {
  padding: 16px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.setting-label ion-icon {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Mute Button */
.mute-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mute-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mute-button:active {
  transform: scale(0.95);
}

.mute-button ion-icon {
  font-size: 1.3rem;
}
```

---

## Part 7: Integration with useGameSession

Update `src/systems/engagement/useGameSession.ts` to auto-trigger sounds:

```typescript
// Add to imports
import { useGameSounds } from '../audio/useGameSounds';

// Inside useGameSession hook:
const {
  playScore,
  playComboSound,
  playHighScore,
  playGameOver,
  playGameStart
} = useGameSounds();

// In startGame function:
const startGame = useCallback(() => {
  playGameStart(); // Add this
  setState(prev => ({ /* ... */ }));
}, [playGameStart]);

// In addScore function:
const addScore = useCallback((points: number, position?: { x: number; y: number }) => {
  playScore(points); // Add this
  setState(prev => { /* ... */ });
}, [playScore, triggerEffect]);

// In incrementCombo function:
const incrementCombo = useCallback((position?: { x: number; y: number }) => {
  setState(prev => {
    const newCombo = prev.combo + 1;
    playComboSound(newCombo); // Add this
    // ... rest of combo logic
    return { /* ... */ };
  });
}, [playComboSound, triggerPreset]);

// In endGame function:
const endGame = useCallback(async () => {
  if (isNewHighScore) {
    playHighScore(); // Add this
  } else {
    playGameOver(); // Add this
  }
  // ... rest of end game logic
}, [playHighScore, playGameOver, /* ... */]);
```

---

## Part 8: Index Export

Create `src/systems/audio/index.ts`:

```typescript
// Context and hooks
export { AudioProvider, useAudio } from './AudioContext';
export { useGameSounds } from './useGameSounds';

// Components
export { SoundSettings, MuteButton } from './SoundSettings';

// Manager (for direct access if needed)
export { SoundManager } from './SoundManager';

// Types and definitions
export { SOUND_DEFINITIONS, getComboSound } from './sounds';
export type { SoundName } from './sounds';
```

---

## Part 9: App Integration

Wrap your app with AudioProvider:

```typescript
// In App.tsx or main entry
import { AudioProvider } from './systems/audio';

function App() {
  return (
    <AudioProvider>
      {/* ... rest of app */}
    </AudioProvider>
  );
}
```

---

## Part 10: Sound Assets

### Option 1: Free Sound Resources

Download from these free sources:
- [Freesound.org](https://freesound.org) - Search "game score", "combo", "achievement"
- [Mixkit.co](https://mixkit.co/free-sound-effects/game/)
- [Kenney.nl](https://kenney.nl/assets?q=audio) - Game-ready sound packs
- [OpenGameArt.org](https://opengameart.org/art-search-advanced?field_art_type_tid=13)

### Option 2: Generate with AI

Use tools like:
- [Soundraw.io](https://soundraw.io)
- [AIVA](https://www.aiva.ai)

### Sound Specifications:

| Sound | Duration | Style |
|-------|----------|-------|
| score | 0.1-0.2s | Short "pop" or "ding" |
| combo-1 | 0.3s | Rising tone |
| combo-5 | 0.4s | Higher rising tone |
| combo-max | 0.5s | Triumphant chord |
| high-score | 1-2s | Fanfare, celebration |
| game-over | 1s | Soft, not punishing |
| button-click | 0.05s | Subtle click |
| achievement | 1.5s | Reward, accomplishment |

---

## Implementation Checklist

- [ ] Create `src/systems/audio/` folder structure
- [ ] Implement `sounds.ts` with definitions
- [ ] Implement `SoundManager.ts` class
- [ ] Create `AudioContext.tsx` provider
- [ ] Create `useGameSounds.ts` hook
- [ ] Build `SoundSettings.tsx` component
- [ ] Add CSS styles
- [ ] Create index exports
- [ ] Wrap app with `AudioProvider`
- [ ] Download/create sound assets
- [ ] Place sounds in `public/assets/sounds/`
- [ ] Integrate with `useGameSession`
- [ ] Test sound playback on mobile and desktop
- [ ] Test volume controls and mute
- [ ] Verify sounds persist after page refresh

---

## Testing Checklist

- [ ] Sounds play on first tap (after user interaction)
- [ ] Score sound plays on every point
- [ ] Combo sounds escalate with combo level
- [ ] High score sound plays on new high score
- [ ] Game over sound plays on game end
- [ ] Mute toggle works
- [ ] Volume sliders work
- [ ] Settings persist after refresh
- [ ] Sounds work on iOS Safari
- [ ] Sounds work on Android Chrome
- [ ] No audio lag/delay
