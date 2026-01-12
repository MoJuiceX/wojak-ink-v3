/**
 * Settings Store
 *
 * Zustand store for app settings including theme, audio preferences.
 * Fully persisted to localStorage.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============ Types ============

export type Theme = 'dark' | 'light' | 'tang-orange' | 'chia-green';

export interface SettingsState {
  // State
  theme: Theme;
  backgroundMusicEnabled: boolean;
  soundEffectsEnabled: boolean;
  reducedMotion: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleBackgroundMusic: () => void;
  toggleSoundEffects: () => void;
  toggleReducedMotion: () => void;
  setBackgroundMusic: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}

// ============ Store ============

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        // State
        theme: 'tang-orange',
        backgroundMusicEnabled: true,
        soundEffectsEnabled: true,
        reducedMotion: false,

        // Actions
        setTheme: (theme: Theme) =>
          set({ theme }, false, 'settings/setTheme'),

        toggleBackgroundMusic: () =>
          set(
            (state) => ({ backgroundMusicEnabled: !state.backgroundMusicEnabled }),
            false,
            'settings/toggleBackgroundMusic'
          ),

        toggleSoundEffects: () =>
          set(
            (state) => ({ soundEffectsEnabled: !state.soundEffectsEnabled }),
            false,
            'settings/toggleSoundEffects'
          ),

        toggleReducedMotion: () =>
          set(
            (state) => ({ reducedMotion: !state.reducedMotion }),
            false,
            'settings/toggleReducedMotion'
          ),

        setBackgroundMusic: (enabled: boolean) =>
          set({ backgroundMusicEnabled: enabled }, false, 'settings/setBackgroundMusic'),

        setSoundEffects: (enabled: boolean) =>
          set({ soundEffectsEnabled: enabled }, false, 'settings/setSoundEffects'),

        setReducedMotion: (enabled: boolean) =>
          set({ reducedMotion: enabled }, false, 'settings/setReducedMotion'),
      }),
      {
        name: 'settings-storage',
      }
    ),
    { name: 'SettingsStore' }
  )
);
