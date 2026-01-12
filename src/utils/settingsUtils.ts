/**
 * Settings Utilities
 *
 * Pure settings management functions without UI dependencies.
 * Used by AudioContext and other services.
 */

// Theme types
export type ThemeMode = 'light' | 'dark' | 'orange' | 'green';

// Settings state interface
export interface AppSettings {
  backgroundMusic: boolean;
  soundEffects: boolean;
  theme: ThemeMode;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  backgroundMusic: true,
  soundEffects: true,
  theme: 'dark',
};

// Storage key
const SETTINGS_STORAGE_KEY = 'wojak_app_settings';

/**
 * Load settings from localStorage
 */
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-orange', 'theme-green');

  // Add new theme class
  root.classList.add(`theme-${theme}`);

  // Also set color-scheme for system UI elements
  if (theme === 'light') {
    root.style.colorScheme = 'light';
  } else {
    root.style.colorScheme = 'dark';
  }
}
