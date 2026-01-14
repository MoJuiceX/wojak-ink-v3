/**
 * Settings Theme Configurations
 *
 * Extended theme configuration for the settings page theme selector.
 * Includes 'system' option and preview colors for each theme.
 */

import type { SettingsThemeConfig, SettingsState } from '@/types/settings';

export const SETTINGS_THEMES: SettingsThemeConfig[] = [
  {
    id: 'tang-orange',
    name: 'Tang Gang',
    description: 'Cyberpunk orange',
    icon: '🍊',
    preview: {
      background: '#0d0400',
      foreground: '#fff5eb',
      accent: '#ff8c00',
      gradient: 'linear-gradient(135deg, #0d0400 0%, #2d1500 50%, #1a0a00 100%)',
    },
    hasGlow: true,
    isSpecial: true,
  },
  {
    id: 'chia-green',
    name: 'Chia Native',
    description: 'Blockchain green',
    icon: '🌱',
    preview: {
      background: '#000f08',
      foreground: '#e8fff0',
      accent: '#22c55e',
      gradient: 'linear-gradient(135deg, #000f08 0%, #002812 50%, #001a0a 100%)',
    },
    hasGlow: true,
    isSpecial: true,
  },
  {
    id: 'void',
    name: 'Void',
    description: 'Pure black OLED',
    icon: '💎',
    preview: {
      background: '#000000',
      foreground: '#ffffff',
      accent: '#ff6b00',
    },
  },
  {
    id: 'dark',
    name: 'Midnight',
    description: 'Deep darkness',
    icon: '🌙',
    preview: {
      background: '#0a0a0f',
      foreground: '#f8f9fa',
      accent: '#ff6b00',
    },
  },
  {
    id: 'light',
    name: 'Clean Canvas',
    description: 'Bright and clean',
    icon: '☀️',
    preview: {
      background: '#fafafa',
      foreground: '#1a1a1f',
      accent: '#e55a00',
    },
  },
];

export const DEFAULT_SETTINGS: SettingsState = {
  theme: {
    selected: 'tang-orange',
    resolved: 'tang-orange',
    systemPreference: 'dark',
  },
  audio: {
    masterEnabled: true,
    masterVolume: 0.7,
    backgroundMusicEnabled: true,
    backgroundMusicVolume: 0.5,
    soundEffectsEnabled: true,
    soundEffectsVolume: 0.8,
    muteOnFocusLoss: false,
    fadeOnPause: true,
  },
  motion: {
    preference: 'system',
    reducedMotion: false,
  },
  app: {
    compactMode: false,
    showTooltips: true,
    confirmBeforeClose: false,
    autoSave: true,
    developerMode: false,
    analyticsEnabled: true,
  },
};

export const APP_VERSION = '4.0';
export const APP_BUILD_DATE = '2026.01.07';

export const SOCIAL_LINKS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    handle: '@MoJuiceX',
    icon: '𝕏',
    url: 'https://x.com/MoJuiceX',
  },
  {
    id: 'tanggang',
    name: 'Tang Gang',
    handle: 'Join Community',
    icon: '🍊',
    url: 'https://tanggang.life/',
  },
  {
    id: 'mintgarden',
    name: 'MintGarden',
    handle: 'View Collection',
    icon: '🌱',
    url: 'https://mintgarden.io/collections/wojak-farmers-plot-col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah',
  },
];
