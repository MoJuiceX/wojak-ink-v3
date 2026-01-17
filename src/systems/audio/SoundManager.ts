/**
 * Sound Manager
 *
 * Core sound management class using audio element pooling for low latency.
 * Handles preloading, volume control, and sound playback.
 */

import { type SoundName, type SoundDefinition, SOUND_DEFINITIONS } from './sounds';

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
  private masterVolume: number = 1;
  private sfxVolume: number = 1;
  private uiVolume: number = 1;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private pendingSounds: Array<{ name: SoundName; volume: number }> = [];
  private loadedSounds: Set<SoundName> = new Set();

  constructor() {
    this.loadPreferences();
  }

  /**
   * Initialize the audio system
   * Should be called after user interaction (click/tap) due to browser policies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Preload all sounds
      await this.preloadSounds();
      this.isInitialized = true;
      console.log('🔊 Sound system initialized');

      // Play any sounds that were requested before initialization
      this.pendingSounds.forEach(({ name, volume }) => this.play(name, volume));
      this.pendingSounds = [];
    } catch (error) {
      console.error('Failed to initialize sound system:', error);
    }
  }

  /**
   * Check if system is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Preload all sound files
   */
  private async preloadSounds(): Promise<void> {
    const loadPromises = SOUND_DEFINITIONS.map(async (definition) => {
      const instances: SoundInstance[] = [];

      // Create pool of audio elements for each sound
      for (let i = 0; i < definition.maxInstances; i++) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = definition.volume * this.getVolumeForCategory(definition.category);

        // Set source and wait for load
        audio.src = definition.url;

        await new Promise<void>((resolve) => {
          const handleLoad = () => {
            this.loadedSounds.add(definition.name);
            resolve();
          };

          const handleError = () => {
            // Don't warn for missing files - they might not exist yet
            resolve();
          };

          audio.addEventListener('canplaythrough', handleLoad, { once: true });
          audio.addEventListener('error', handleError, { once: true });

          // Timeout after 3 seconds
          setTimeout(resolve, 3000);
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
      this.pendingSounds.push({ name, volume: volumeMultiplier });
      return;
    }

    if (this.isMuted) return;

    const pool = this.pools.get(name);
    if (!pool) {
      return;
    }

    // Check if sound was loaded successfully
    if (!this.loadedSounds.has(name)) {
      return;
    }

    // Find an available instance or use the next in rotation
    const instance = pool.instances[pool.currentIndex];
    if (!instance) return;

    // Reset and play
    instance.audio.currentTime = 0;
    instance.audio.volume = pool.definition.volume *
      this.getVolumeForCategory(pool.definition.category) *
      volumeMultiplier;

    instance.audio.play().catch(() => {
      // Autoplay was prevented - this is normal on first interaction
    });

    // Rotate to next instance
    pool.currentIndex = (pool.currentIndex + 1) % pool.instances.length;
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
    try {
      localStorage.setItem('wojak-sound-prefs', JSON.stringify(prefs));
    } catch {
      // localStorage might be unavailable
    }
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
    } catch {
      // Use defaults
    }
  }
}

// Singleton instance
export const SoundManager = new SoundManagerClass();
