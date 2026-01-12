/**
 * Settings Theme Configurations
 *
 * Extended theme configuration for the settings page theme selector.
 * Includes 'system' option and preview colors for each theme.
 */

import type { SettingsThemeConfig, SettingsState } from '@/types/settings';

export const SETTINGS_THEMES: SettingsThemeConfig[] = [
  {
    id: 'system',
    name: 'System',
    description: 'Match your device settings',
    icon: '💻',
    preview: {
      background: 'linear-gradient(135deg, #1a1a1a 50%, #ffffff 50%)',
      foreground: '#888888',
      accent: '#ff6b00',
    },
  },
  {
    id: 'dark',
    name: 'Midnight Void',
    description: 'Deep immersive darkness for night browsing',
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
    description: 'Bright and accessible for daytime viewing',
    icon: '☀️',
    preview: {
      background: '#fafafa',
      foreground: '#1a1a1f',
      accent: '#e55a00',
    },
  },
  {
    id: 'tang-orange',
    name: 'Tang Gang',
    description: 'Full cyberpunk orange experience',
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
    description: 'Embrace the blockchain aesthetic',
    icon: '🌿',
    preview: {
      background: '#000f08',
      foreground: '#e8fff0',
      accent: '#22c55e',
      gradient: 'linear-gradient(135deg, #000f08 0%, #002812 50%, #001a0a 100%)',
    },
    hasGlow: true,
    isSpecial: true,
  },
];

export const DEFAULT_SETTINGS: SettingsState = {
  theme: {
    selected: 'system',
    resolved: 'dark',
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

export const APP_VERSION = '2.0.0';
export const APP_BUILD_DATE = '2025.01.11';

export const SOCIAL_LINKS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    handle: '@WojakInk',
    icon: '𝕏',
    url: 'https://twitter.com/WojakInk',
  },
  {
    id: 'discord',
    name: 'Discord',
    handle: 'Join Community',
    icon: '💬',
    url: 'https://discord.gg/tanggang',
  },
  {
    id: 'mintgarden',
    name: 'MintGarden',
    handle: 'View Collection',
    icon: '🌿',
    url: 'https://mintgarden.io/collections/wojak-farmers-plot',
  },
];
