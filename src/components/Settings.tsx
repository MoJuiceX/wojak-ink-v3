import { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonButton,
  IonButtons,
} from '@ionic/react';
import { close, musicalNotes, volumeHigh, colorPalette, sunny, moon } from 'ionicons/icons';
import './Settings.css';

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

// LocalStorage key
const SETTINGS_STORAGE_KEY = 'wojak_app_settings';

// Load settings from localStorage
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

// Save settings to localStorage
function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

// Apply theme to document
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

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
    saveSettings(newSettings);

    // Apply theme immediately if changed
    if (key === 'theme') {
      applyTheme(value as ThemeMode);
    }
  };

  const themes: { id: ThemeMode; label: string; icon: string; color: string }[] = [
    { id: 'light', label: 'Light', icon: sunny, color: '#f5f5f5' },
    { id: 'dark', label: 'Dark', icon: moon, color: '#1a1a2e' },
    { id: 'orange', label: 'Orange', icon: colorPalette, color: '#ff8c00' },
    { id: 'green', label: 'Green', icon: colorPalette, color: '#2ecc71' },
  ];

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="settings-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="settings-content">
        {/* Audio Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Audio</h3>
          <IonList className="settings-list">
            <IonItem className="settings-item">
              <IonIcon icon={musicalNotes} slot="start" className="settings-icon" />
              <IonLabel>
                <h2>Background Music</h2>
                <p>Play music while browsing</p>
              </IonLabel>
              <IonToggle
                checked={settings.backgroundMusic}
                onIonChange={(e) => updateSetting('backgroundMusic', e.detail.checked)}
                className="settings-toggle"
              />
            </IonItem>
            <IonItem className="settings-item">
              <IonIcon icon={volumeHigh} slot="start" className="settings-icon" />
              <IonLabel>
                <h2>Sound Effects</h2>
                <p>UI sounds and game audio</p>
              </IonLabel>
              <IonToggle
                checked={settings.soundEffects}
                onIonChange={(e) => updateSetting('soundEffects', e.detail.checked)}
                className="settings-toggle"
              />
            </IonItem>
          </IonList>
        </div>

        {/* Theme Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Theme</h3>
          <div className="theme-grid">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={`theme-option ${settings.theme === theme.id ? 'selected' : ''}`}
                onClick={() => updateSetting('theme', theme.id)}
              >
                <div
                  className="theme-preview"
                  style={{ backgroundColor: theme.color }}
                >
                  <IonIcon icon={theme.icon} />
                </div>
                <span className="theme-label">{theme.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="settings-section app-info">
          <p className="app-version">Wojak.ink Mobile v1.0.0</p>
          <p className="app-credit">4200 Wojak Farmers Plot NFTs on Chia</p>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default Settings;
