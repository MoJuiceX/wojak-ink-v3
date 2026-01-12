/**
 * Settings System Types
 *
 * Comprehensive type definitions for the settings page including
 * audio controls, motion preferences, and app settings.
 */

import type { ThemeId } from './theme';

// ============ Extended Theme Types ============

export type SettingsThemeId = ThemeId | 'system';

export type ResolvedTheme = Exclude<SettingsThemeId, 'system'>;

export interface ThemePreview {
  background: string;
  foreground: string;
  accent: string;
  gradient?: string;
}

export interface SettingsThemeConfig {
  id: SettingsThemeId;
  name: string;
  description: string;
  icon: string;
  preview: ThemePreview;
  hasGlow?: boolean;
  isSpecial?: boolean;
}

// ============ Audio Types ============

export interface AudioSettings {
  masterEnabled: boolean;
  masterVolume: number;
  backgroundMusicEnabled: boolean;
  backgroundMusicVolume: number;
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  muteOnFocusLoss: boolean;
  fadeOnPause: boolean;
}

// ============ Motion Preferences ============

export type MotionPreference = 'system' | 'reduced' | 'full';

export interface MotionSettings {
  preference: MotionPreference;
  reducedMotion: boolean;
}

// ============ App Settings ============

export interface AppSettings {
  compactMode: boolean;
  showTooltips: boolean;
  confirmBeforeClose: boolean;
  autoSave: boolean;
  developerMode: boolean;
  analyticsEnabled: boolean;
}

// ============ Combined Settings State ============

export interface SettingsState {
  theme: {
    selected: SettingsThemeId;
    resolved: ResolvedTheme;
    systemPreference: 'dark' | 'light';
  };
  audio: AudioSettings;
  motion: MotionSettings;
  app: AppSettings;
}

// ============ Settings Context ============

export interface SettingsContextValue {
  settings: SettingsState;

  // Theme
  setTheme: (themeId: SettingsThemeId) => void;

  // Audio
  setMasterVolume: (volume: number) => void;
  toggleMasterAudio: () => void;
  setBackgroundMusicVolume: (volume: number) => void;
  toggleBackgroundMusic: () => void;
  setSoundEffectsVolume: (volume: number) => void;
  toggleSoundEffects: () => void;

  // Motion
  setMotionPreference: (pref: MotionPreference) => void;

  // App
  updateAppSettings: (settings: Partial<AppSettings>) => void;

  // Bulk
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

// ============ Toast Types ============

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

// ============ Admin Types ============

export interface AdminInfo {
  isAdmin: boolean;
  userId?: string;
  permissions?: string[];
}
